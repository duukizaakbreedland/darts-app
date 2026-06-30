// CPU-tuning per niveau (1 = makkelijkst, 10 = sterkst).
// Gekalibreerd via scripts/calibrate-cpu.mjs.

export const CPU_LEVELS = 10

// Spreiding (sigma in mm) waarmee de CPU op T20 mikt → bepaalt het scoor-gemiddelde.
// Niveau 1..10 → 3-dart gemiddelde ~30..75 (stappen van 5).
const SIGMA_BY_LEVEL = [62.7, 43.9, 32.0, 24.7, 20.8, 18.6, 16.5, 15.0, 13.6, 12.5]

// Doel 3-dart gemiddelde per niveau (puur informatief / voor weergave).
const AVG_BY_LEVEL = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75]

// Aparte, gevloerde kans om een gerichte dubbel te raken bij een finish-poging.
// Losgekoppeld van de scoor-spreiding zodat lage niveaus tóch binnen redelijke
// tijd kunnen uitgooien (de pure spreiding geeft op niveau 1 maar ~1.6%).
const DOUBLE_CHANCE_BY_LEVEL = [0.12, 0.14, 0.16, 0.18, 0.21, 0.24, 0.27, 0.3, 0.33, 0.36]

function clampLevel(level: number): number {
  return Math.min(CPU_LEVELS, Math.max(1, Math.round(level)))
}

/** Scoor-spreiding (mm) voor een niveau. */
export function cpuSigma(level: number): number {
  return SIGMA_BY_LEVEL[clampLevel(level) - 1]
}

/** Kans (0-1) om een gerichte dubbel te raken bij een finish-poging. */
export function cpuDoubleChance(level: number): number {
  return DOUBLE_CHANCE_BY_LEVEL[clampLevel(level) - 1]
}

/** Doel 3-dart gemiddelde voor een niveau (voor weergave/labels). */
export function cpuTargetAverage(level: number): number {
  return AVG_BY_LEVEL[clampLevel(level) - 1]
}
