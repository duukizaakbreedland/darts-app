import type { Visit } from '../hooks/useX01Game'

export interface GamePlayerStats {
  name: string
  threeDartAvg: number
  first9Avg: number
  bestLeg: number | null // minste darts om een gewonnen leg uit te gooien
  legsWon: number
  highestScore: number
  highestFinish: number
  count180: number
  count140plus: number
  count120plus: number
  count100plus: number
  totalDarts: number
}

/** Bereken per-speler statistieken van één afgelopen X01-potje uit de worpen. */
export function computeX01GameStats(visits: Visit[], players: string[]): GamePlayerStats[] {
  return players.map((name, p) => {
    const mine = visits.filter(v => v.player === p)
    const totalDarts = mine.reduce((n, v) => n + v.darts, 0)
    const totalPoints = mine.reduce((n, v) => n + v.points, 0)

    // First 9: eerste 3 beurten van elke leg
    let f9Points = 0
    let f9Darts = 0
    const legKeys = new Set(mine.map(v => `${v.set}-${v.leg}`))
    for (const key of legKeys) {
      const legVisits = mine.filter(v => `${v.set}-${v.leg}` === key).slice(0, 3)
      for (const v of legVisits) {
        f9Points += v.points
        f9Darts += v.darts
      }
    }

    // Beste leg: minste darts in een leg die deze speler uitgooide
    let bestLeg: number | null = null
    let legsWon = 0
    for (const key of legKeys) {
      const legVisits = mine.filter(v => `${v.set}-${v.leg}` === key)
      const wonLeg = legVisits.some(v => v.checkout)
      if (wonLeg) {
        legsWon++
        const darts = legVisits.reduce((n, v) => n + v.darts, 0)
        if (bestLeg === null || darts < bestLeg) bestLeg = darts
      }
    }

    const nonBust = mine.filter(v => !v.bust)
    const highestScore = nonBust.reduce((m, v) => Math.max(m, v.points), 0)
    const highestFinish = mine.filter(v => v.checkout).reduce((m, v) => Math.max(m, v.points), 0)

    return {
      name,
      threeDartAvg: totalDarts > 0 ? (totalPoints / totalDarts) * 3 : 0,
      first9Avg: f9Darts > 0 ? (f9Points / f9Darts) * 3 : 0,
      bestLeg,
      legsWon,
      highestScore,
      highestFinish,
      count180: nonBust.filter(v => v.points === 180).length,
      count140plus: nonBust.filter(v => v.points >= 140).length,
      count120plus: nonBust.filter(v => v.points >= 120).length,
      count100plus: nonBust.filter(v => v.points >= 100).length,
      totalDarts,
    }
  })
}
