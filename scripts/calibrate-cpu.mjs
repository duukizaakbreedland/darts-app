// Kalibratie van de CPU-niveaus. Zoekt per niveau de spreiding (sigma, in mm)
// zodat het IN-GAME 3-dart gemiddelde (volledige 501-legs, inclusief opzet-,
// finish- en bust-darts) het doel haalt. Spiegelt src/lib/dartboard.ts +
// cpuStrategy.ts. Draaien: `node scripts/calibrate-cpu.mjs`

// ─── Dartbord-geometrie (mm, oorsprong = bull-centrum) ───────────────────────
const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const RIB = 6.35, ROB = 15.9, RTI = 99, RTO = 107, RDI = 162, RDO = 170

function scoreAt(x, y) {
  const r = Math.hypot(x, y)
  if (r <= RIB) return { value: 50, ring: 'inner-bull' }
  if (r <= ROB) return { value: 25, ring: 'outer-bull' }
  if (r > RDO) return { value: 0, ring: 'miss' }
  let a = (Math.atan2(x, y) * 180) / Math.PI
  if (a < 0) a += 360
  const n = NUMBERS[Math.floor((a + 9) / 18) % 20]
  if (r >= RTI && r <= RTO) return { value: n * 3, ring: 'triple' }
  if (r >= RDI && r <= RDO) return { value: n * 2, ring: 'double' }
  return { value: n, ring: 'single' }
}

function gauss() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function aimAt(n, r) {
  const i = NUMBERS.indexOf(n)
  const a = (i * 18 * Math.PI) / 180
  return { x: r * Math.sin(a), y: r * Math.cos(a) }
}
const tripleAim = n => aimAt(n, (RTI + RTO) / 2)
const singleAim = n => aimAt(n, (ROB + RTI) / 2)
const throwDart = (aim, s) => scoreAt(aim.x + gauss() * s, aim.y + gauss() * s)

// ─── CPU-strategie (gelijk aan src/lib/cpuStrategy.ts) ───────────────────────
const DOUBLE_CHANCE = [0.12, 0.14, 0.16, 0.18, 0.21, 0.24, 0.27, 0.3, 0.33, 0.36]
const isDD = r => r === 50 || (r >= 2 && r <= 40 && r % 2 === 0)
function chooseTarget(r) {
  if (isDD(r)) return { kind: 'double', number: r === 50 ? 25 : r / 2 }
  if (r > 60) return { kind: 'score' }
  for (const leave of [32, 40, 16]) {
    const s = r - leave
    if (s >= 1 && s <= 20) return { kind: 'setup', single: s }
  }
  if (r > 40) return { kind: 'setup', single: 20 }
  const s = r - 2
  return { kind: 'setup', single: s >= 1 && s <= 20 ? s : 1 }
}
function simTurn(remaining, sigma, dc) {
  let r = remaining
  for (let d = 1; d <= 3; d++) {
    const t = chooseTarget(r)
    if (t.kind === 'double') {
      if (Math.random() < dc) return { points: remaining, darts: d, checkout: true }
      if (Math.random() < 0.45) {
        const sg = t.number === 25 ? 25 : t.number
        if (r - sg >= 2) r -= sg
      }
      continue
    }
    const aim = t.kind === 'score' ? tripleAim(20) : singleAim(t.single)
    const res = throwDart(aim, sigma)
    const after = r - res.value
    if (after < 0 || after === 1) return { points: 0, darts: 3, checkout: false }
    if (after === 0) {
      if (res.ring === 'double' || res.ring === 'inner-bull')
        return { points: remaining, darts: d, checkout: true }
      return { points: 0, darts: 3, checkout: false }
    }
    r = after
  }
  return { points: remaining - r, darts: 3, checkout: false }
}

function legStats(sigma, dc, N) {
  let pts = 0, darts = 0, totDarts = 0
  for (let i = 0; i < N; i++) {
    let score = 501, dl = 0
    while (true) {
      const t = simTurn(score, sigma, dc)
      pts += t.points; darts += t.darts; dl += t.darts
      if (t.checkout) break
      score -= t.points
    }
    totDarts += dl
  }
  return { avg: (pts / darts) * 3, dartsPerLeg: totDarts / N }
}

// sigma kleiner → hoger gemiddelde (monotoon); binaire zoektocht
function sigmaForAvg(target, dc) {
  let lo = 3, hi = 160
  for (let it = 0; it < 26; it++) {
    const mid = (lo + hi) / 2
    if (legStats(mid, dc, 2500).avg > target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ─── Draaien ─────────────────────────────────────────────────────────────────
console.log('Niveau | doel | sigma(mm) | in-game gem | darts/leg')
console.log('-------|------|-----------|-------------|----------')
const sigmas = []
for (let lvl = 1; lvl <= 10; lvl++) {
  const target = 25 + lvl * 5
  const dc = DOUBLE_CHANCE[lvl - 1]
  const sigma = sigmaForAvg(target, dc)
  const { avg, dartsPerLeg } = legStats(sigma, dc, 15000)
  sigmas.push(+sigma.toFixed(1))
  console.log(
    `  ${String(lvl).padStart(2)}   |  ${target}  |   ${sigma.toFixed(1).padStart(5)}   |    ${avg.toFixed(1).padStart(5)}    |   ${dartsPerLeg.toFixed(1)}`
  )
}
console.log('\nSIGMA_BY_LEVEL =', JSON.stringify(sigmas))
