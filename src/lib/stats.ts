import { supabase } from './supabase'

export type StatsPeriod = 'all' | 'day' | 'week' | 'month'

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
  count120plus: number
  count100plus: number
  totalDarts: number
}

/** Per-speler samenvatting van één potje (voor de recente-potjes-lijst). */
export interface RecentGame {
  id: string
  completedAt: string | null
  startingScore: number
  winnerId: string | null
  players: {
    playerId: string
    name: string
    threeDartAvg: number
    first9Avg: number
    bestLeg: number | null
    legsWon: number
    highestScore: number
    highestFinish: number
    count100plus: number
    count120plus: number
    count140plus: number
    totalDarts: number
    isWinner: boolean
  }[]
}

interface TurnRow {
  player_id: string
  score: number
  is_bust: boolean
  is_checkout: boolean
  round_number: number
  leg_id: string
}

interface Agg {
  threeDartAvg: number
  first9Avg: number
  bestLeg: number | null
  avgDartsPerLeg: number
  legsWon: number
  highestScore: number
  highestFinish: number
  count180: number
  count140plus: number
  count120plus: number
  count100plus: number
  totalDarts: number
}

function periodCutoff(period: StatsPeriod): string | null {
  const now = new Date()
  if (period === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  if (period === 'week') return new Date(now.getTime() - 7 * 864e5).toISOString()
  if (period === 'month') return new Date(now.getTime() - 30 * 864e5).toISOString()
  return null
}

/** Aggregeer een set worpen tot per-speler statistieken. */
function aggregateTurns(turns: TurnRow[]): Map<string, Agg> {
  const out = new Map<string, Agg>()
  const scored = new Map<string, number>()
  const f9p = new Map<string, number>()
  const f9d = new Map<string, number>()
  const legDarts = new Map<string, number>() // leg_id-player → darts
  const legWon = new Map<string, boolean>()

  const ensure = (id: string): Agg => {
    let a = out.get(id)
    if (!a) {
      a = {
        threeDartAvg: 0, first9Avg: 0, bestLeg: null, avgDartsPerLeg: 0, legsWon: 0,
        highestScore: 0, highestFinish: 0, count180: 0, count140plus: 0, count120plus: 0,
        count100plus: 0, totalDarts: 0,
      }
      out.set(id, a)
    }
    return a
  }
  const add = (m: Map<string, number>, k: string, n: number) => m.set(k, (m.get(k) ?? 0) + n)

  for (const t of turns) {
    const a = ensure(t.player_id)
    a.totalDarts += 3
    const lk = `${t.leg_id}-${t.player_id}`
    add(legDarts, lk, 3)
    if (t.is_checkout) legWon.set(lk, true)
    if (!t.is_bust) {
      add(scored, t.player_id, t.score)
      if (t.score > a.highestScore) a.highestScore = t.score
      if (t.score === 180) a.count180 += 1
      if (t.score >= 140) a.count140plus += 1
      if (t.score >= 120) a.count120plus += 1
      if (t.score >= 100) a.count100plus += 1
    }
    if (t.round_number <= 3) {
      add(f9p, t.player_id, t.is_bust ? 0 : t.score)
      add(f9d, t.player_id, 3)
    }
    if (t.is_checkout && t.score > a.highestFinish) a.highestFinish = t.score
  }

  const wonDarts = new Map<string, number[]>()
  for (const [key, won] of legWon) {
    if (!won) continue
    const playerId = key.slice(key.indexOf('-') + 1)
    const arr = wonDarts.get(playerId) ?? []
    arr.push(legDarts.get(key) ?? 0)
    wonDarts.set(playerId, arr)
  }

  for (const [id, a] of out) {
    a.threeDartAvg = a.totalDarts > 0 ? ((scored.get(id) ?? 0) / a.totalDarts) * 3 : 0
    const fd = f9d.get(id) ?? 0
    a.first9Avg = fd > 0 ? ((f9p.get(id) ?? 0) / fd) * 3 : 0
    const arr = wonDarts.get(id) ?? []
    a.legsWon = arr.length
    a.bestLeg = arr.length ? Math.min(...arr) : null
    a.avgDartsPerLeg = arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : 0
  }
  return out
}

async function loadTurns(gameIds: string[]): Promise<{ turns: TurnRow[]; legGame: Map<string, string> }> {
  const { data: legs, error } = await supabase.from('legs').select('id, game_id').in('game_id', gameIds)
  if (error) throw error
  const legGame = new Map((legs ?? []).map(l => [l.id, l.game_id]))
  const legIds = [...legGame.keys()]
  if (!legIds.length) return { turns: [], legGame }
  const { data, error: tErr } = await supabase
    .from('turns')
    .select('player_id, score, is_bust, is_checkout, round_number, leg_id')
    .in('leg_id', legIds)
  if (tErr) throw tErr
  return { turns: data ?? [], legGame }
}

/** Totale X01-statistieken per speler, gefilterd op periode. */
export async function fetchX01Stats(period: StatsPeriod = 'all'): Promise<PlayerStats[]> {
  let q = supabase
    .from('games')
    .select('id, winner_id')
    .eq('game_type', 'x01')
    .eq('status', 'completed')
  const cutoff = periodCutoff(period)
  if (cutoff) q = q.gte('completed_at', cutoff)

  const { data: games, error: gErr } = await q
  if (gErr) throw gErr
  if (!games || games.length === 0) return []

  const gameIds = games.map(g => g.id)
  const [{ data: gps, error: gpErr }, { data: players, error: pErr }, { turns }] = await Promise.all([
    supabase.from('game_players').select('player_id').in('game_id', gameIds),
    supabase.from('players').select('id, name'),
    loadTurns(gameIds),
  ])
  if (gpErr) throw gpErr
  if (pErr) throw pErr

  const nameById = new Map((players ?? []).map(p => [p.id, p.name]))
  const agg = aggregateTurns(turns)

  const played = new Map<string, number>()
  const won = new Map<string, number>()
  for (const gp of gps ?? []) played.set(gp.player_id, (played.get(gp.player_id) ?? 0) + 1)
  for (const g of games) if (g.winner_id) won.set(g.winner_id, (won.get(g.winner_id) ?? 0) + 1)

  const ids = new Set<string>([...played.keys(), ...agg.keys()])
  const result: PlayerStats[] = [...ids].map(id => {
    const a = agg.get(id)
    return {
      playerId: id,
      name: nameById.get(id) ?? '?',
      gamesPlayed: played.get(id) ?? 0,
      gamesWon: won.get(id) ?? 0,
      threeDartAvg: a?.threeDartAvg ?? 0,
      first9Avg: a?.first9Avg ?? 0,
      bestLeg: a?.bestLeg ?? null,
      avgDartsPerLeg: a?.avgDartsPerLeg ?? 0,
      legsWon: a?.legsWon ?? 0,
      highestScore: a?.highestScore ?? 0,
      highestFinish: a?.highestFinish ?? 0,
      count180: a?.count180 ?? 0,
      count140plus: a?.count140plus ?? 0,
      count120plus: a?.count120plus ?? 0,
      count100plus: a?.count100plus ?? 0,
      totalDarts: a?.totalDarts ?? 0,
    }
  })
  return result.sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.gamesWon - a.gamesWon)
}

/** De meest recente X01-potjes, elk met per-speler stats. */
export async function fetchRecentGames(limit = 10): Promise<RecentGame[]> {
  const { data: games, error } = await supabase
    .from('games')
    .select('id, winner_id, completed_at, settings')
    .eq('game_type', 'x01')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  if (!games || games.length === 0) return []

  const gameIds = games.map(g => g.id)
  const [{ data: gps, error: gpErr }, { data: players, error: pErr }, { turns, legGame }] =
    await Promise.all([
      supabase.from('game_players').select('game_id, player_id, order_num').in('game_id', gameIds),
      supabase.from('players').select('id, name'),
      loadTurns(gameIds),
    ])
  if (gpErr) throw gpErr
  if (pErr) throw pErr

  const nameById = new Map((players ?? []).map(p => [p.id, p.name]))

  // turns per game
  const turnsByGame = new Map<string, TurnRow[]>()
  for (const t of turns) {
    const gid = legGame.get(t.leg_id)
    if (!gid) continue
    const arr = turnsByGame.get(gid) ?? []
    arr.push(t)
    turnsByGame.set(gid, arr)
  }

  return games.map(g => {
    const agg = aggregateTurns(turnsByGame.get(g.id) ?? [])
    const gamePlayers = (gps ?? [])
      .filter(gp => gp.game_id === g.id)
      .sort((a, b) => a.order_num - b.order_num)
    return {
      id: g.id,
      completedAt: g.completed_at,
      startingScore: (g.settings as { startingScore?: number })?.startingScore ?? 501,
      winnerId: g.winner_id,
      players: gamePlayers.map(gp => {
        const a = agg.get(gp.player_id)
        return {
          playerId: gp.player_id,
          name: nameById.get(gp.player_id) ?? '?',
          threeDartAvg: a?.threeDartAvg ?? 0,
          first9Avg: a?.first9Avg ?? 0,
          bestLeg: a?.bestLeg ?? null,
          legsWon: a?.legsWon ?? 0,
          highestScore: a?.highestScore ?? 0,
          highestFinish: a?.highestFinish ?? 0,
          count100plus: a?.count100plus ?? 0,
          count120plus: a?.count120plus ?? 0,
          count140plus: a?.count140plus ?? 0,
          totalDarts: a?.totalDarts ?? 0,
          isWinner: g.winner_id === gp.player_id,
        }
      }),
    }
  })
}
