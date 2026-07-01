import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GameHeader } from '../components/GameHeader'
import {
  useCricket,
  CRICKET_NUMBERS_STANDARD,
  CRICKET_NUMBERS_TACTICS,
} from '../hooks/useCricket'
import { cpuCricketDart } from '../lib/cpuGames'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  variant?: 'standard' | 'tactics'
  scoring?: boolean
  legs?: number
  sets?: number
}

const numLabel = (n: number) => (n === 25 ? 'Bull' : String(n))

/** Marks als vullende puntjes; groen wanneer gesloten (3). */
function Marks({ count }: { count: number }) {
  const closed = count >= 3
  return (
    <div className="flex gap-0.5 justify-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < count ? (closed ? 'bg-emerald-400' : 'bg-slate-300') : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  )
}

export function CricketScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? { players: ['Speler 1', 'Speler 2'] }
  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)

  const numbers = (nav.variant ?? 'standard') === 'tactics' ? CRICKET_NUMBERS_TACTICS : CRICKET_NUMBERS_STANDARD
  const game = useCricket({
    players,
    numbers,
    scoring: nav.scoring ?? true,
    legsToWin: Math.ceil((nav.legs ?? 1) / 2),
    setsToWin: Math.ceil((nav.sets ?? 1) / 2),
  })
  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const turnDone = game.turnDarts >= 3
  const [mult, setMult] = useState(1)
  const showSetsLegs = (nav.legs ?? 1) > 1 || (nav.sets ?? 1) > 1

  const allClosed = (numIdx: number) => players.every((_, pi) => game.marks[pi][numIdx] >= 3)

  useEffect(() => {
    if (game.winner !== null) {
      navigate('/game-over', {
        state: { winner: players[game.winner], players, rematchPath: '/training/cricket' },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner])

  // CPU gooit automatisch, dart voor dart
  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null || game.turnDarts >= 3) return
    const delay = game.turnDarts === 0 ? 1000 : 550
    const id = setTimeout(() => {
      const res = cpuCricketDart(numbers, game.marks[active], allClosed, level)
      if (res) game.hit(res.numberIndex, res.marks)
      else game.miss()
    }, delay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.turnDarts, game.winner])

  // Na 3 darts automatisch door
  useEffect(() => {
    if (game.winner !== null || game.turnDarts < 3) return
    const id = setTimeout(() => game.pass(), 650)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turnDarts, game.winner])

  // multiplier resetten na elke dart / beurt
  useEffect(() => {
    setMult(1)
  }, [game.turnDarts, active])

  const canUndo = !activeIsCpu && game.turnDarts > 0
  const inputDisabled = activeIsCpu || turnDone

  const hitNumber = (numIdx: number) => {
    game.hit(numIdx, mult)
  }

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      <GameHeader title="Cricket" backTo="/training/cricket" canUndo={canUndo} onUndo={() => game.undo()} />

      {/* Board: namen/score + rijen per nummer */}
      <div className="border-b border-slate-800">
        <div className="flex items-stretch">
          {/* Namen + scores per speler */}
          {players.map((name, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-2 border-b-2 transition-all ${
                active === i ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {active === i && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                <span className={`text-xs font-semibold truncate ${active === i ? 'text-slate-100' : 'text-slate-500'}`}>
                  {cpuLevels[i] != null ? `${name} · ${cpuLevels[i]}` : name}
                </span>
              </div>
              {showSetsLegs && (
                <div className="text-[11px] text-slate-500">
                  <span className={`font-bold ${active === i ? 'text-slate-300' : 'text-slate-600'}`}>{game.setsWon[i]}</span> s
                  <span className="mx-0.5 text-slate-700">·</span>
                  <span className={`font-bold ${active === i ? 'text-slate-300' : 'text-slate-600'}`}>{game.legsWon[i]}</span> l
                </div>
              )}
              {game.scoring && (
                <div className={`text-4xl font-bold leading-tight ${active === i ? 'text-slate-100' : 'text-slate-600'}`}>
                  {game.scores[i]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nummer-rijen: [marks p1] [nummer] [marks p2] ... */}
        <div className="flex flex-col">
          {numbers.map((num, idx) => (
            <div key={num} className="relative flex items-center border-t border-slate-800/70">
              {players.map((_, pi) => (
                <div key={pi} className="flex-1 flex justify-center py-1.5">
                  <Marks count={game.marks[pi][idx]} />
                </div>
              ))}
              <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-sm font-bold text-slate-400 bg-slate-900 px-2">{numLabel(num)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Beurt-hint */}
      <div className="h-9 flex items-center justify-center">
        <span className="text-xs text-slate-500 uppercase tracking-widest">
          {activeIsCpu ? 'Computer gooit…' : `${['·', '· ·', '· · ·'][game.turnDarts] || ''} pijl ${Math.min(game.turnDarts + 1, 3)} / 3`}
        </span>
      </div>

      {/* Invoer — vult de resterende ruimte */}
      <div className={`flex-1 flex flex-col gap-2 p-3 ${inputDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Multiplier */}
        <div className="flex gap-2">
          {[
            { label: 'Single', v: 1 },
            { label: 'Double', v: 2 },
            { label: 'Triple', v: 3 },
          ].map(m => (
            <button
              key={m.v}
              onClick={() => setMult(m.v)}
              className={`flex-1 h-12 rounded-lg text-base font-bold transition-colors ${
                mult === m.v ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Nummers — vullen de rest van het scherm */}
        <div className="grid grid-cols-4 auto-rows-fr gap-2 flex-1">
          {numbers.map((num, idx) => (
            <button
              key={num}
              onClick={() => hitNumber(idx)}
              className="rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-2xl font-bold shadow-md shadow-emerald-900/30 transition-colors"
            >
              {numLabel(num)}
            </button>
          ))}
          <button
            onClick={() => game.miss()}
            className="rounded-xl bg-red-600 active:bg-red-700 text-white text-2xl font-bold shadow-md shadow-red-900/30 transition-colors"
          >
            Mis
          </button>
        </div>
      </div>
    </div>
  )
}
