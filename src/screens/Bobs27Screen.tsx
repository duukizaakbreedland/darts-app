import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GameHeader } from '../components/GameHeader'
import { useBobs27 } from '../hooks/useBobs27'
import { cpuBobsHit } from '../lib/cpuGames'
import { saveTrainingGame } from '../lib/saveGame'

interface NavState {
  players: string[]
  cpuLevels?: (number | null)[]
  playerIds?: (string | null)[]
}

const targetLabel = (t: number) => (t === 25 ? 'Bull' : `Double ${t}`)

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

export function Bobs27Screen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? { players: ['Speler 1', 'Speler 2'] }
  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)

  const game = useBobs27({ players })
  const active = game.activePlayer
  const activeIsCpu = cpuLevels[active] != null
  const turnDone = game.turnHits.length >= 3

  useEffect(() => {
    if (game.winner !== null) {
      const w = game.winner
      if (nav.playerIds) {
        void saveTrainingGame(
          'bobs27',
          {},
          nav.playerIds,
          w,
          players.map((_, i) => ({
            won: i === w,
            score: game.scores[i],
            metrics: { eliminated: game.eliminated[i] },
          }))
        )
      }
      navigate('/game-over', {
        state: {
          winner: players[w],
          rematchPath: '/training/bobs27',
          statTable: {
            players,
            winnerIndex: w,
            rows: [
              { label: 'Eindscore', values: players.map((_, i) => game.scores[i]) },
              { label: 'Status', values: players.map((_, i) => (game.eliminated[i] ? 'uit' : '—')) },
            ],
          },
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner])

  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null || game.turnHits.length >= 3) return
    const delay = game.turnHits.length === 0 ? 1000 : 550
    const id = setTimeout(() => game.dart(cpuBobsHit(game.target, level)), delay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.turnHits.length, game.winner])

  useEffect(() => {
    if (game.winner !== null || game.turnHits.length < 3) return
    const id = setTimeout(() => game.pass(), 750)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turnHits.length, game.winner])

  const canUndo = !activeIsCpu && game.turnHits.length > 0
  const inputDisabled = activeIsCpu || turnDone

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      <GameHeader title="Bob's 27" backTo="/training/bobs27" canUndo={canUndo} onUndo={() => game.undo()} />

      {/* Speler-panelen */}
      <div className="flex">
        {players.map((name, i) => {
          const isActive = active === i
          const out = game.eliminated[i]
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
              <div className={`text-5xl font-bold leading-none ${out ? 'text-red-400' : isActive ? 'text-slate-100' : 'text-slate-600'}`}>
                {game.scores[i]}
              </div>
              <div className="text-xs mt-2">
                {out ? <span className="text-red-400 font-semibold">uit</span> : <span className="text-slate-500">punten</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Doel + stippen */}
      <div className="flex flex-col items-center gap-2 py-3 border-b border-slate-800">
        <span className="text-xs text-slate-500 uppercase tracking-widest">
          {activeIsCpu ? 'Computer gooit…' : `Ronde ${game.round + 1} / ${game.totalRounds} · mik op`}
        </span>
        <div className="text-4xl font-bold text-emerald-400 leading-none">{targetLabel(game.target)}</div>
        <span className="text-xs text-slate-500">
          treffer +{game.targetValue} · mis −{game.targetValue}
        </span>
        <Dots darts={game.turnHits} />
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
