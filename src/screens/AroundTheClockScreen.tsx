import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAroundTheClock } from '../hooks/useAroundTheClock'
import { cpuAtcHit } from '../lib/cpuGames'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  endOnBull?: boolean
}

const targetLabel = (n: number) => (n === 25 ? 'Bull' : String(n))

function Dots({ darts }: { darts: boolean[] }) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map(i => {
        const thrown = i < darts.length
        const hit = thrown && darts[i]
        return (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${
              !thrown ? 'bg-slate-700' : hit ? 'bg-emerald-500' : 'bg-red-500/70'
            }`}
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

  const targets = useMemo(() => {
    const base = Array.from({ length: 20 }, (_, i) => i + 1)
    return nav.endOnBull ? [...base, 25] : base
  }, [nav.endOnBull])

  const game = useAroundTheClock({ players, targets })
  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const T = targets.length
  const turnDone = game.turnDarts.length >= 3
  const currentTarget = targets[game.positions[active]]

  // Naar game-over bij winnaar
  useEffect(() => {
    if (game.winner !== null) {
      navigate('/game-over', {
        state: { winner: players[game.winner], players, rematchPath: '/training/atc' },
      })
    }
  }, [game.winner])

  // CPU speelt automatisch, dart voor dart
  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null) return
    if (game.turnDarts.length < 3) {
      const target = targets[game.positions[active]]
      const delay = game.turnDarts.length === 0 ? 1000 : 550
      const id = setTimeout(() => game.dart(cpuAtcHit(target, level)), delay)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => game.pass(), 700)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.turnDarts.length, game.winner])

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
                  {game.positions[i]}
                </span>{' '}
                / {T} geraakt
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
      <div className="mt-auto flex flex-col gap-3 p-4">
        <div className="flex flex-col items-center gap-3">
          {!turnDone && !activeIsCpu && (
            <div className="text-center">
              <span className="text-xs text-slate-500 uppercase tracking-widest">Mik op</span>
              <div className="text-3xl font-bold text-emerald-400">{targetLabel(currentTarget)}</div>
            </div>
          )}
          <Dots darts={game.turnDarts} />
        </div>

        <div className={activeIsCpu ? 'opacity-40 pointer-events-none' : ''}>
          {!turnDone ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => game.dart(true)}
                className="h-16 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xl font-bold shadow-lg shadow-emerald-900/30 transition-colors"
              >
                Raak
              </button>
              <button
                onClick={() => game.dart(false)}
                className="h-16 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xl font-bold active:bg-slate-700 transition-colors"
              >
                Mis
              </button>
            </div>
          ) : (
            <button
              onClick={() => game.pass()}
              className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xl font-bold shadow-lg shadow-blue-900/40 transition-colors"
            >
              Volgende speler →
            </button>
          )}
        </div>

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
