import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GameHeader } from '../components/GameHeader'
import { useSinglesTraining } from '../hooks/useSinglesTraining'
import { cpuSingleHit } from '../lib/cpuGames'
import { saveTrainingGame } from '../lib/saveGame'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  playerIds?: (string | null)[]
  order?: 'asc' | 'random'
  includeBull?: boolean
}

const targetLabel = (t: number) => (t === 25 ? 'Bull' : String(t))

function buildTargets(order: 'asc' | 'random', includeBull: boolean): number[] {
  let nums = Array.from({ length: 20 }, (_, i) => i + 1)
  if (order === 'random') {
    nums = nums.slice()
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
  }
  return includeBull ? [...nums, 25] : nums
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

export function SinglesScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? { players: ['Speler 1', 'Speler 2'] }
  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)

  const [targets] = useState(() => buildTargets(nav.order ?? 'asc', nav.includeBull ?? false))
  const game = useSinglesTraining({ players, targets })
  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const turnDone = game.turnDarts.length >= 3

  useEffect(() => {
    if (game.winner !== null) {
      const w = game.winner
      if (nav.playerIds) {
        void saveTrainingGame(
          'singles',
          { targets: targets.length },
          nav.playerIds,
          w,
          players.map((_, i) => ({ won: i === w, score: game.scores[i] }))
        )
      }
      navigate('/game-over', {
        state: { winner: players[w], players, rematchPath: '/training/singles' },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner])

  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null || game.turnDarts.length >= 3) return
    const delay = game.turnDarts.length === 0 ? 1000 : 550
    const id = setTimeout(() => game.dart(cpuSingleHit(game.target, level)), delay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.turnDarts.length, game.winner])

  useEffect(() => {
    if (game.winner !== null || game.turnDarts.length < 3) return
    const id = setTimeout(() => game.pass(), 650)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turnDarts.length, game.winner])

  const canUndo = !activeIsCpu && game.turnDarts.length > 0
  const inputDisabled = activeIsCpu || turnDone

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      <GameHeader title="Singles Training" backTo="/training/singles" canUndo={canUndo} onUndo={() => game.undo()} />

      {/* Speler-panelen */}
      <div className="flex">
        {players.map((name, i) => {
          const isActive = active === i
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
              <div className={`text-5xl font-bold leading-none ${isActive ? 'text-slate-100' : 'text-slate-600'}`}>
                {game.scores[i]}
              </div>
              <div className="text-xs text-slate-500 mt-2">punten</div>
            </div>
          )
        })}
      </div>

      {/* Doel + stippen */}
      <div className="flex flex-col items-center gap-2 py-3 border-b border-slate-800">
        <span className="text-xs text-slate-500 uppercase tracking-widest">
          {activeIsCpu ? 'Computer gooit…' : `Ronde ${game.round + 1} / ${game.totalRounds} · mik op`}
        </span>
        <div className="text-6xl font-bold text-emerald-400 leading-none">{targetLabel(game.target)}</div>
        <Dots darts={game.turnDarts} />
      </div>

      {/* Raak / Mis */}
      <div className={`flex-1 p-3 ${inputDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-2 gap-3 h-full">
          <button
            onClick={() => game.dart(false)}
            className="rounded-2xl bg-red-600 active:bg-red-700 text-white text-3xl font-bold shadow-lg shadow-red-900/30 transition-colors"
          >
            Mis
          </button>
          <button
            onClick={() => game.dart(true)}
            className="rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white text-3xl font-bold shadow-lg shadow-emerald-900/30 transition-colors"
          >
            Raak
          </button>
        </div>
      </div>
    </div>
  )
}
