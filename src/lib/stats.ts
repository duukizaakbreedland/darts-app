import { supabase } from './supabase'

export interface PlayerStats {
  playerId: string
  name: string
  gamesPlayed: number
  gamesWon: number
  threeDartAvg: number
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
  leg_id: string
}

/** Haal alle X01-statistieken op, gegroepeerd per speler. */
export async function fetchX01Stats(): Promise<PlayerStats[]> {
  const { data: games, error: gErr } = await supabase
    .from('games')
    .select('id, winner_id')
    .eq('game_type', 'x01')
    .eq('status', 'completed')
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
      .select('player_id, score, is_bust, is_checkout, leg_id')
      .in('leg_id', legIds)
    if (error) throw error
    turns = data ?? []
  }

  const nameById = new Map((players ?? []).map(p => [p.id, p.name]))
  const stats = new Map<string, PlayerStats>()
  const scored = new Map<string, number>()

  const ensure = (id: string): PlayerStats => {
    let s = stats.get(id)
    if (!s) {
      s = {
        playerId: id, name: nameById.get(id) ?? '?',
        gamesPlayed: 0, gamesWon: 0, threeDartAvg: 0, highestFinish: 0,
        count180: 0, count140plus: 0, count100plus: 0, totalDarts: 0,
      }
      stats.set(id, s)
    }
    return s
  }

  for (const gp of gps ?? []) ensure(gp.player_id).gamesPlayed += 1
  for (const g of games) if (g.winner_id) ensure(g.winner_id).gamesWon += 1

  for (const t of turns) {
    const s = ensure(t.player_id)
    s.totalDarts += 3
    if (!t.is_bust) {
      scored.set(t.player_id, (scored.get(t.player_id) ?? 0) + t.score)
      if (t.score === 180) s.count180 += 1
      if (t.score >= 140) s.count140plus += 1
      if (t.score >= 100) s.count100plus += 1
    }
    if (t.is_checkout && t.score > s.highestFinish) s.highestFinish = t.score
  }

  for (const [id, s] of stats) {
    const pts = scored.get(id) ?? 0
    s.threeDartAvg = s.totalDarts > 0 ? (pts / s.totalDarts) * 3 : 0
  }

  return [...stats.values()].sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.gamesWon - a.gamesWon)
}
