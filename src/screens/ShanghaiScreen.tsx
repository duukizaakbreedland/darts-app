import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GameHeader } from '../components/GameHeader'
import { useShanghai, type SegOutcome } from '../hooks/useShanghai'
import { cpuShanghaiDart } from '../lib/cpuGames'
import { saveTrainingGame } from '../lib/saveGame'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  playerIds?: (string | null)[]
  rounds?: number
}

function Dots({ darts }: { darts: SegOutcome[] }) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map(i => {
        const o = i < darts.length ? darts[i] : null
        const color =
          o == null ? 'bg-slate-700' : o === 'miss' ? 'bg-red-500/70' : 'bg-emerald-500'
        return <span key={i} className={`w-3 h-3 rounded-full ${color}`} />
      })}
    </div>
  )
}

export function ShanghaiScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? { players: ['Speler 1', 'Speler 2'] }
  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)

  const game = useShanghai({ players, rounds: nav.rounds ?? 7 })
  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const turnDone = game.turn.length >= 3

  useEffect(() => {
    if (game.winner !== null) {
      const w = game.winner
      const label = game.shanghai ? `${players[w]} — SHANGHAI! 🎉` : players[w]
      if (nav.playerIds) {
        void saveTrainingGame(
          'shanghai',
          { rounds: nav.rounds ?? 7 },
          nav.playerIds,
          w,
          players.map((_, i) => ({
            won: i === w,
            score: game.scores[i],
            metrics: { shanghai: game.shanghai && i === w },
          }))
        )
      }
      navigate('/game-over', {
        state: { winner: label, players, rematchPath: '/training/shanghai' },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner])

  // CPU gooit automatisch, dart voor dart
  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null || game.turn.length >= 3) return
    const delay = game.turn.length === 0 ? 1000 : 550
    const id = setTimeout(() => game.dart(cpuShanghaiDart(game.round, level)), delay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.turn.length, game.winner])

  // Na 3 darts automatisch door
  useEffect(() => {
    if (game.winner !== null || game.turn.length < 3) return
    const id = setTimeout(() => game.pass(), 650)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn.length, game.winner])

  const canUndo = !activeIsCpu && game.turn.length > 0
  const inputDisabled = activeIsCpu || turnDone

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      <GameHeader title="Shanghai" backTo="/training/shanghai" canUndo={canUndo} onUndo={() => game.undo()} />

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

      {/* Ronde + mik op + stippen */}
      <div className="flex flex-col items-center gap-2 py-3 border-b border-slate-800">
        <span className="text-xs text-slate-500 uppercase tracking-widest">
          {activeIsCpu ? 'Computer gooit…' : `Ronde ${game.round} / ${game.rounds} · mik op`}
        </span>
        <div className="text-6xl font-bold text-emerald-400 leading-none">{game.round}</div>
        <Dots darts={game.turn} />
      </div>

      {/* Knoppen */}
      <div className={`flex-1 p-3 ${inputDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
          {(['single', 'double', 'triple'] as SegOutcome[]).map(o => (
            <button
              key={o}
              onClick={() => game.dart(o)}
              className="rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white text-2xl font-bold shadow-lg shadow-emerald-900/30 transition-colors"
            >
              {o === 'single' ? `Single (${game.round})` : o === 'double' ? `Double (${game.round * 2})` : `Triple (${game.round * 3})`}
            </button>
          ))}
          <button
            onClick={() => game.dart('miss')}
            className="rounded-2xl bg-red-600 active:bg-red-700 text-white text-2xl font-bold shadow-lg shadow-red-900/30 transition-colors"
          >
            Mis
          </button>
        </div>
      </div>
    </div>
  )
}
