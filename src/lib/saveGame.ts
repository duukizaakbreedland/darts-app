import { supabase } from './supabase'
import type { Visit } from '../hooks/useX01Game'

export type TrainingGameType = 'cricket' | 'around_the_clock' | 'shanghai' | 'checkout_training'
// (bob's 27 en singles slaan we op onder eigen sleutels hieronder)

export interface TrainingResult {
  won: boolean
  score: number | null
  metrics?: Record<string, number | boolean | null>
}

/**
 * Slaat een voltooid trainingsspel op: games-rij + game_players + game_results
 * (per menselijke speler). Computer wordt overgeslagen. Faalt stil.
 */
export async function saveTrainingGame(
  gameType: string,
  settings: Record<string, unknown>,
  playerIds: (string | null)[],
  winnerIndex: number,
  results: TrainingResult[]
): Promise<boolean> {
  if (!playerIds.some(id => id != null)) return false
  try {
    const winnerId = playerIds[winnerIndex] ?? null
    const { data: game, error: gErr } = await supabase
      .from('games')
      .insert({
        game_type: gameType,
        settings: settings as never,
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (gErr) throw gErr
    const gameId = game.id

    const gpRows = playerIds
      .map((id, idx) => (id ? { game_id: gameId, player_id: id, order_num: idx } : null))
      .filter((r): r is { game_id: string; player_id: string; order_num: number } => r != null)
    if (gpRows.length) {
      const { error } = await supabase.from('game_players').insert(gpRows)
      if (error) throw error
    }

    const resultRows = playerIds
      .map((id, idx) =>
        id
          ? {
              game_id: gameId,
              player_id: id,
              won: results[idx]?.won ?? false,
              score: results[idx]?.score ?? null,
              metrics: (results[idx]?.metrics ?? {}) as never,
            }
          : null
      )
      .filter(r => r != null)
    if (resultRows.length) {
      const { error } = await supabase.from('game_results').insert(resultRows as never)
      if (error) throw error
    }
    return true
  } catch (e) {
    console.warn('Trainingsspel opslaan mislukt:', e)
    return false
  }
}

export interface SaveX01Params {
  startingScore: number
  legs: number
  sets: number
  playerIds: (string | null)[] // null = computer
  cpuLevels: (number | null)[]
  winnerIndex: number
  visits: Visit[]
}

const legKey = (set: number, leg: number) => `${set}-${leg}`

/**
 * Slaat een voltooid X01-potje op in Supabase. Alleen menselijke spelers
 * (met een echt profiel-id) worden vastgelegd; computer-worpen slaan we over.
 * Faalt stil (bijv. offline) — de aanroeper hoeft niet te wachten.
 */
export async function saveX01Game(p: SaveX01Params): Promise<boolean> {
  const hasHuman = p.playerIds.some(id => id != null)
  if (!hasHuman) return false

  try {
    const winnerId = p.playerIds[p.winnerIndex] ?? null

    // 1. games
    const { data: game, error: gErr } = await supabase
      .from('games')
      .insert({
        game_type: 'x01',
        settings: { startingScore: p.startingScore, legs: p.legs, sets: p.sets, cpuLevels: p.cpuLevels },
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (gErr) throw gErr
    const gameId = game.id

    // 2. game_players (alleen mensen)
    const gpRows = p.playerIds
      .map((id, idx) => (id ? { game_id: gameId, player_id: id, order_num: idx } : null))
      .filter((r): r is { game_id: string; player_id: string; order_num: number } => r != null)
    if (gpRows.length) {
      const { error } = await supabase.from('game_players').insert(gpRows)
      if (error) throw error
    }

    // 3. legs — in volgorde van voorkomen; winnaar = speler van de checkout-visit
    const order: string[] = []
    const seen = new Set<string>()
    const legWinner = new Map<string, number>()
    for (const v of p.visits) {
      const k = legKey(v.set, v.leg)
      if (!seen.has(k)) {
        seen.add(k)
        order.push(k)
      }
      if (v.checkout) legWinner.set(k, v.player)
    }

    const legIdByKey = new Map<string, string>()
    for (const k of order) {
      const [set, leg] = k.split('-').map(Number)
      const w = legWinner.get(k)
      const { data: legRow, error } = await supabase
        .from('legs')
        .insert({
          game_id: gameId,
          leg_number: leg,
          set_id: null,
          winner_id: w != null ? p.playerIds[w] ?? null : null,
        })
        .select('id')
        .single()
      if (error) throw error
      legIdByKey.set(k, legRow.id)
      // set wordt nog niet apart opgeslagen; leg_number volstaat voor stats
      void set
    }

    // 4. turns (alleen menselijke spelers)
    const roundCounters = new Map<string, number>() // per leg+player
    const turnRows = p.visits
      .filter(v => p.playerIds[v.player] != null)
      .map(v => {
        const rk = `${legKey(v.set, v.leg)}-${v.player}`
        const rn = (roundCounters.get(rk) ?? 0) + 1
        roundCounters.set(rk, rn)
        return {
          leg_id: legIdByKey.get(legKey(v.set, v.leg))!,
          player_id: p.playerIds[v.player]!,
          round_number: rn,
          score: v.points,
          remaining_before: v.remainingBefore,
          remaining_after: v.remainingAfter,
          is_bust: v.bust,
          is_checkout: v.checkout,
        }
      })
    if (turnRows.length) {
      const { error } = await supabase.from('turns').insert(turnRows)
      if (error) throw error
    }

    return true
  } catch (e) {
    console.warn('Potje opslaan mislukt:', e)
    return false
  }
}
