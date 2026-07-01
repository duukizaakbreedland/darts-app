import { supabase } from './supabase'

export type StatsPeriod = 'all' | 'day' | 'week' | 'month' | 'last10'

export interface PlayerStats {
  playerId: string
  name: string
  gamesPlayed: number
  gamesWon: number
  threeDartAvg: number
  first9Avg: number
  bestLeg: number | null
  avgDartsPerLeg: number
  legsWon: number
  highestScore: number
  highestFinish: number
  count180: number
  count140plus: number
  count100plus: number
  totalDarts: number
}

interface TurnRow {
  player_id: string
  score: number
  is_bust: boolean
  is_checkout: boolean
  round_number: number
  leg_id: string
}

function periodCutoff(period: StatsPeriod): string | null {
  const now = new Date()
  if (period === 'day') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return d.toISOString()
  }
  if (period === 'week') return new Date(now.getTime() - 7 * 864e5).toISOString()
  if (period === 'month') return new Date(now.getTime() - 30 * 864e5).toISOString()
  return null
}

/** Haal X01-statistieken op per speler, gefilterd op periode. */
export async function fetchX01Stats(period: StatsPeriod = 'all'): Promise<PlayerStats[]> {
  let q = supabase
    .from('games')
    .select('id, winner_id, completed_at')
    .eq('game_type', 'x01')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const cutoff = periodCutoff(period)
  if (cutoff) q = q.gte('completed_at', cutoff)
  if (period === 'last10') q = q.limit(10)

  const { data: games, error: gErr } = await q
  if (gErr) throw gErr
  if (!games || games.length === 0) return []

  const gameIds = games.map(g => g.id)

  const [{ data: gps, error: gpErr }, { data: players, error: pErr }, { data: legs, error: lErr }] =
    await Promise.all([
      supabase.from('game_players').select('game_id, player_id').in('game_id', gameIds),
      supabase.from('players').select('id, name'),
      supabase.from('legs').select('id').in('game_id', gameIds),
    ])
  if (gpErr) throw gpErr
  if (pErr) throw pErr
  if (lErr) throw lErr

  const legIds = (legs ?? []).map(l => l.id)
  let turns: TurnRow[] = []
  if (legIds.length) {
    const { data, error } = await supabase
      .from('turns')
      .select('player_id, score, is_bust, is_checkout, round_number, leg_id')
      .in('leg_id', legIds)
    if (error) throw error
    turns = data ?? []
  }

  const nameById = new Map((players ?? []).map(p => [p.id, p.name]))
  const stats = new Map<string, PlayerStats>()
  const scored = new Map<string, number>()
  const f9Points = new Map<string, number>()
  const f9Darts = new Map<string, number>()
  // per (leg, speler): darts en of gewonnen
  const legDarts = new Map<string, number>()
  const legWon = new Map<string, boolean>()

  const ensure = (id: string): PlayerStats => {
    let s = stats.get(id)
    if (!s) {
      s = {
        playerId: id, name: nameById.get(id) ?? '?',
        gamesPlayed: 0, gamesWon: 0, threeDartAvg: 0, first9Avg: 0, bestLeg: null,
        avgDartsPerLeg: 0, legsWon: 0, highestScore: 0, highestFinish: 0,
        count180: 0, count140plus: 0, count100plus: 0, totalDarts: 0,
      }
      stats.set(id, s)
    }
    return s
  }

  for (const gp of gps ?? []) ensure(gp.player_id).gamesPlayed += 1
  for (const g of games) if (g.winner_id) ensure(g.winner_id).gamesWon += 1

  const add = (m: Map<string, number>, k: string, n: number) => m.set(k, (m.get(k) ?? 0) + n)

  for (const t of turns) {
    const s = ensure(t.player_id)
    s.totalDarts += 3
    const legKey = `${t.leg_id}-${t.player_id}`
    add(legDarts, legKey, 3)
    if (t.is_checkout) legWon.set(legKey, true)

    if (!t.is_bust) {
      add(scored, t.player_id, t.score)
      if (t.score > s.highestScore) s.highestScore = t.score
      if (t.score === 180) s.count180 += 1
      if (t.score >= 140) s.count140plus += 1
      if (t.score >= 100) s.count100plus += 1
    }
    if (t.round_number <= 3) {
      add(f9Points, t.player_id, t.is_bust ? 0 : t.score)
      add(f9Darts, t.player_id, 3)
    }
    if (t.is_checkout && t.score > s.highestFinish) s.highestFinish = t.score
  }

  // legs → beste leg + gemiddeld darts/leg + legs gewonnen
  const wonDartsByPlayer = new Map<string, number[]>()
  for (const [key, won] of legWon) {
    if (!won) continue
    const playerId = key.slice(key.indexOf('-') + 1)
    const darts = legDarts.get(key) ?? 0
    const arr = wonDartsByPlayer.get(playerId) ?? []
    arr.push(darts)
    wonDartsByPlayer.set(playerId, arr)
  }
  for (const [id, arr] of wonDartsByPlayer) {
    const s = ensure(id)
    s.legsWon = arr.length
    s.bestLeg = arr.length ? Math.min(...arr) : null
    s.avgDartsPerLeg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  }

  for (const [id, s] of stats) {
    s.threeDartAvg = s.totalDarts > 0 ? ((scored.get(id) ?? 0) / s.totalDarts) * 3 : 0
    const fd = f9Darts.get(id) ?? 0
    s.first9Avg = fd > 0 ? ((f9Points.get(id) ?? 0) / fd) * 3 : 0
  }

  return [...stats.values()].sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.gamesWon - a.gamesWon)
}
