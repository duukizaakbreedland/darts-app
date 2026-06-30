import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  useAroundTheClock,
  isBullTarget,
  type AtcHitMode,
  type DartOutcome,
} from '../hooks/useAroundTheClock'
import { cpuAtcDart } from '../lib/cpuGames'

type Order = 'desc' | 'asc' | 'random'
type End = 'none' | 'bull' | 'bullseye'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  order?: Order
  hitMode?: AtcHitMode
  hitsRequired?: number
  increaseBySegment?: boolean
  end?: End
}

const targetLabel = (n: number) => (n === 25 ? 'Bull' : n === 50 ? 'Bullseye' : String(n))

function ringWordFor(hitMode: AtcHitMode): string {
  return hitMode === 'single' ? 'Single' : hitMode === 'double' ? 'Double' : hitMode === 'triple' ? 'Triple' : ''
}

function buildTargets(order: Order, end: End): number[] {
  const nums = Array.from({ length: 20 }, (_, i) => i + 1)
  let ordered: number[]
  if (order === 'desc') ordered = nums.slice().reverse()
  else if (order === 'random') {
    ordered = nums.slice()
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ordered[i], ordered[j]] = [ordered[j], ordered[i]]
    }
  } else ordered = nums
  const endArr = end === 'bull' ? [25] : end === 'bullseye' ? [50] : []
  return [...ordered, ...endArr]
}

function Dots({ darts }: { darts: boolean[] }) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map(i => {
        const thrown = i < darts.length
        const hit = thrown && darts[i]
        return (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${!thrown ? 'bg-slate-700' : hit ? 'bg-emerald-500' : 'bg-red-500/70'}`}
          />
        )
      })}
    </div>
  )
}

export function AroundTheClockScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? { players: ['Speler 1', 'Speler 2'] }
  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)
  const hitMode = nav.hitMode ?? 'all'

  const [targets] = useState(() => buildTargets(nav.order ?? 'asc', nav.end ?? 'none'))

  const game = useAroundTheClock({
    players,
    targets,
    hitMode,
    hitsRequired: nav.hitsRequired ?? 1,
    increaseBySegment: nav.increaseBySegment ?? false,
  })

  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const T = targets.length
  const turnDone = game.turnDarts.length >= 3
  const currentTarget = targets[game.positions[active]]
  const isBull = currentTarget != null && isBullTarget(currentTarget)
  const needSegment = game.increaseBySegment && !isBull
  const raakOutcome: DartOutcome = isBull || hitMode === 'all' ? 'single' : hitMode
  const ringWord = isBull ? '' : ringWordFor(hitMode)
  const showProgress = game.hitsRequired > 1 && !game.increaseBySegment

  // Naar game-over bij winnaar
  useEffect(() => {
    if (game.winner !== null) {
      navigate('/game-over', {
        state: { winner: players[game.winner], players, rematchPath: '/training/atc' },
      })
    }
  }, [game.winner])

  // CPU gooit automatisch, dart voor dart
  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null || game.turnDarts.length >= 3) return
    const target = targets[game.positions[active]]
    const delay = game.turnDarts.length === 0 ? 1000 : 550
    const id = setTimeout(
      () => game.dart(cpuAtcDart(target, hitMode, game.increaseBySegment, level)),
      delay
    )
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.turnDarts.length, game.winner])

  // Na de 3e pijl automatisch door naar de volgende speler (mens én computer)
  useEffect(() => {
    if (game.winner !== null || game.turnDarts.length < 3) return
    const id = setTimeout(() => game.pass(), 800)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turnDarts.length, game.winner])

  const canUndo = !activeIsCpu && game.turnDarts.length > 0

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-slate-800">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 h-11 px-3 rounded-lg text-slate-300 active:bg-slate-800 transition-colors"
        >
          <span className="text-2xl leading-none">‹</span>
          <span className="text-sm font-medium">Terug</span>
        </button>
        <div className="text-sm font-bold text-slate-200">Around the Clock</div>
        <div className="w-[88px]" />
      </div>

      {/* Speler-panelen */}
      <div className="flex">
        {players.map((name, i) => {
          const done = game.positions[i] >= T
          const isActive = active === i
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center text-center p-4 border-b-2 transition-all ${
                isActive ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {isActive && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
                  {cpuLevels[i] != null ? `${name} · niv. ${cpuLevels[i]}` : name}
                </span>
              </div>
              <div className={`text-5xl font-bold leading-none ${isActive ? 'text-slate-100' : 'text-slate-600'}`}>
                {done ? '✓' : targetLabel(targets[game.positions[i]])}
              </div>
              <div className="text-xs text-slate-500 mt-3">
                <span className={`font-bold ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                  {Math.min(game.positions[i], T)}
                </span>{' '}
                / {T}
              </div>
            </div>
          )
        })}
      </div>

      {/* Beurt-indicator */}
      <div className="h-11 flex items-center justify-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
            {activeIsCpu ? 'Computer gooit…' : `${players[active]} aan de beurt`}
          </span>
        </div>
      </div>

      {/* Invoer */}
      <div className="mt-auto flex flex-col gap-4 p-4">
        {/* Mik op + stippen */}
        <div className="flex flex-col items-center gap-3">
          {!activeIsCpu && currentTarget != null && (
            <div className="text-center">
              <span className="text-sm text-slate-500 uppercase tracking-widest">
                Mik op{ringWord ? ` ${ringWord}` : ''}
              </span>
              <div className={`font-bold text-emerald-400 leading-none mt-1 ${isBull ? 'text-5xl' : 'text-7xl'}`}>
                {targetLabel(currentTarget)}
                {showProgress && (
                  <span className="text-2xl text-slate-500 font-medium ml-2">
                    {game.progress[active]}/{game.hitsRequired}
                  </span>
                )}
              </div>
            </div>
          )}
          <Dots darts={game.turnDarts} />
        </div>

        {/* Knoppen (verborgen tijdens CPU-beurt of na 3 pijlen) */}
        {!turnDone && (
          <div className={activeIsCpu ? 'opacity-40 pointer-events-none' : ''}>
            {needSegment ? (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  {(['single', 'double', 'triple'] as DartOutcome[]).map(o => (
                    <button
                      key={o}
                      onClick={() => game.dart(o)}
                      className="h-20 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-base font-bold shadow-lg shadow-emerald-900/30 transition-colors"
                    >
                      {o === 'single' ? 'Single' : o === 'double' ? 'Double' : 'Triple'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => game.dart('miss')}
                  className="w-full h-16 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-lg font-bold transition-colors"
                >
                  Mis
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  onClick={() => game.dart('miss')}
                  className="aspect-square rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-2xl font-bold shadow-lg shadow-red-900/30 transition-colors"
                >
                  Mis
                </button>
                <button
                  onClick={() => game.dart(raakOutcome)}
                  className="aspect-square rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-2xl font-bold shadow-lg shadow-emerald-900/30 transition-colors"
                >
                  Raak
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => game.undo()}
          disabled={!canUndo}
          className={`h-11 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            canUndo
              ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border-slate-700 text-slate-300'
              : 'bg-slate-800/50 border-slate-800 text-slate-700 cursor-not-allowed'
          }`}
        >
          <span className="text-base">↩</span>
          <span>Undo</span>
        </button>
      </div>
    </div>
  )
}
