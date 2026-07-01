import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GameHeader } from '../components/GameHeader'
import { useCheckout, type CheckoutRange } from '../hooks/useCheckout'
import { getCheckout } from '../lib/checkouts'
import { cpuCheckoutResult } from '../lib/cpuGames'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  range?: CheckoutRange
  target?: number
  seed?: number[]
}

export function CheckoutScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? { players: ['Speler 1', 'Speler 2'] }
  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)

  const game = useCheckout({
    players,
    range: nav.range ?? 'all',
    target: nav.target ?? 5,
    seed: nav.seed ?? [40],
  })

  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const target = game.currentTarget
  const hint = getCheckout(target)

  useEffect(() => {
    if (game.winner !== null) {
      navigate('/game-over', {
        state: { winner: players[game.winner], players, rematchPath: '/training/checkout' },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner])

  // CPU beslist automatisch
  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null) return
    const id = setTimeout(() => game.result(cpuCheckoutResult(target, level)), 1300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.index, game.winner])

  const canUndo = !activeIsCpu && (game.index > 0 || game.attempts.some(a => a > 0))

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      <GameHeader title="Checkout" backTo="/training/checkout" canUndo={canUndo} onUndo={() => game.undo()} />

      {/* Speler-panelen */}
      <div className="flex">
        {players.map((name, i) => {
          const isActive = active === i
          const avg = game.finishes[i] > 0 ? (game.dartsUsed[i] / game.finishes[i]).toFixed(1) : '–'
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center text-center p-3 border-b-2 transition-all ${
                isActive ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {isActive && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
                  {cpuLevels[i] != null ? `${name} · niv. ${cpuLevels[i]}` : name}
                </span>
              </div>
              <div className={`text-4xl font-bold leading-none ${isActive ? 'text-slate-100' : 'text-slate-600'}`}>
                {game.finishes[i]}
                <span className="text-lg text-slate-500 font-medium"> / {game.goalFinishes}</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {game.attempts[i]} pogingen · gem {avg} darts
              </div>
            </div>
          )
        })}
      </div>

      {/* Target */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest">
          {activeIsCpu ? 'Computer gooit…' : 'Gooi uit'}
        </span>
        <div className="text-8xl font-bold text-emerald-400 leading-none">{target}</div>
        {hint && <div className="text-lg font-semibold text-slate-400 tracking-wide">{hint}</div>}
      </div>

      {/* Invoer: geslaagd in 1/2/3 darts of mislukt */}
      <div className={`p-3 flex flex-col gap-2 ${activeIsCpu ? 'opacity-40 pointer-events-none' : ''}`}>
        <span className="text-center text-xs text-slate-600 uppercase tracking-widest">In hoeveel darts?</span>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => game.result(d)}
              className="h-16 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-2xl font-bold shadow-lg shadow-emerald-900/30 transition-colors"
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={() => game.result(null)}
          className="h-14 rounded-xl bg-red-600 active:bg-red-700 text-white text-lg font-bold shadow-lg shadow-red-900/30 transition-colors"
        >
          Niet gehaald
        </button>
      </div>
    </div>
  )
}
