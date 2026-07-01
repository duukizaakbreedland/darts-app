import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PlayerScore } from '../components/PlayerScore'
import { Keypad } from '../components/Keypad'
import { CheckoutModal } from '../components/CheckoutModal'
import { HistoryModal } from '../components/HistoryModal'
import { getCheckout, isCheckoutable } from '../lib/checkouts'
import { useX01Game, playerAverage, legStats, lastVisit } from '../hooks/useX01Game'
import { simulateCpuTurn } from '../lib/cpuStrategy'
import { saveX01Game } from '../lib/saveGame'
import { computeX01GameStats } from '../lib/gameStats'

interface NavState {
  players: string[]
  startingScore: number
  legs: number
  sets: number
  cpuLevels?: (number | null)[]
  playerIds?: (string | null)[]
}

export function GameScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = (location.state as NavState) ?? {
    players: ['Speler 1', 'Speler 2'], startingScore: 501, legs: 3, sets: 1,
  }

  const game = useX01Game({
    players: nav.players,
    startingScore: nav.startingScore,
    legsToWin: Math.ceil(nav.legs / 2),
    setsToWin: Math.ceil(nav.sets / 2),
  })

  const [inputValue, setInputValue] = useState('')
  const [bustFlash, setBustFlash] = useState(false)
  const [pendingCheckout, setPendingCheckout] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const players = nav.players
  const cpuLevels = nav.cpuLevels ?? players.map(() => null)
  const active = game.activePlayer
  const activeScore = game.scores[active]
  const activeIsCpu = cpuLevels[active] != null

  // Naar game-over springen zodra er een winnaar is; potje op de achtergrond opslaan
  useEffect(() => {
    if (game.winner !== null) {
      const winnerIndex = game.winner
      if (nav.playerIds) {
        void saveX01Game({
          startingScore: nav.startingScore,
          legs: nav.legs,
          sets: nav.sets,
          playerIds: nav.playerIds,
          cpuLevels,
          winnerIndex,
          visits: game.visits,
        })
      }
      navigate('/game-over', {
        state: {
          winner: players[winnerIndex],
          players,
          setsWon: game.setsWon,
          rematchPath: '/new-game',
          playerStats: computeX01GameStats(game.visits, players),
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner])

  // Computer speelt automatisch zijn beurt
  useEffect(() => {
    if (game.winner !== null) return
    const level = cpuLevels[active]
    if (level == null) return
    const id = setTimeout(() => {
      const turn = simulateCpuTurn(game.scores[active], level)
      game.submit({
        points: turn.points,
        darts: turn.darts,
        checkout: turn.checkout,
        dartsAtDouble: turn.dartsAtDouble,
      })
    }, 1200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, game.currentLeg, game.currentSet, game.winner])

  const handleSubmit = (points: number) => {
    if (activeIsCpu || points > 180 || points < 0 || bustFlash) return
    const remaining = activeScore - points

    // Geldige checkout → eerst de dubbel-vraag tonen
    if (remaining === 0 && isCheckoutable(activeScore)) {
      setPendingCheckout(points)
      return
    }

    // Bust-flash tonen
    if (remaining < 0 || remaining === 1 || remaining === 0) {
      setBustFlash(true)
      game.submit({ points, darts: 3, checkout: false })
      setInputValue('')
      setTimeout(() => setBustFlash(false), 900)
      return
    }

    game.submit({ points, darts: 3, checkout: false })
    setInputValue('')
  }

  const handleKeypadConfirm = () => {
    if (!inputValue) return
    handleSubmit(parseInt(inputValue))
  }

  const handleCheckoutConfirm = (dartsForCheckout: number, dartsAtDouble: number) => {
    if (pendingCheckout === null) return
    game.submit({ points: pendingCheckout, darts: dartsForCheckout, checkout: true, dartsAtDouble })
    setPendingCheckout(null)
    setInputValue('')
  }

  const handleUndo = () => {
    setInputValue('')
    setBustFlash(false)
    const last = game.visits[game.visits.length - 1]
    game.undo()
    // Was de laatste beurt van de computer? Draai ook de mensbeurt ervoor terug,
    // zodat de speler opnieuw gooit (anders speelt de CPU meteen weer automatisch).
    if (last && cpuLevels[last.player] != null) {
      game.undo()
    }
  }

  return (
    <div className="flex flex-col h-svh bg-slate-900 pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 h-11 px-3 rounded-lg text-slate-300 active:bg-slate-800 transition-colors"
        >
          <span className="text-2xl leading-none">‹</span>
          <span className="text-sm font-medium">Terug</span>
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-600 uppercase tracking-widest font-medium">
            Set {game.currentSet} · Leg {game.currentLeg}
          </div>
          <div className="text-sm font-bold text-slate-200">{nav.startingScore} · Double Out</div>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-300 text-2xl active:bg-slate-800 transition-colors"
        >
          ☰
        </button>
      </div>

      {/* Speler-scores */}
      <div className="flex">
        {players.map((name, i) => {
          const stats = legStats(game.visits, i, game.currentLeg, game.currentSet)
          const lv = lastVisit(game.visits, i, game.currentLeg, game.currentSet)
          const displayName = cpuLevels[i] != null ? `${name} · niv. ${cpuLevels[i]}` : name
          return (
            <PlayerScore
              key={i}
              name={displayName}
              score={game.scores[i]}
              setsWon={game.setsWon[i]}
              legsWon={game.legsWon[i]}
              avg={playerAverage(game.visits, i)}
              rounds={stats.rounds}
              darts={stats.darts}
              isActive={active === i}
              lastScore={lv ? lv.points : null}
              lastBust={lv ? lv.bust : false}
              checkout={isCheckoutable(game.scores[i]) ? getCheckout(game.scores[i]) : undefined}
            />
          )
        })}
      </div>

      {/* Keypad (met alleen een 'Computer gooit…'-hint tijdens de CPU-beurt) */}
      <div className="mt-auto">
        {activeIsCpu && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
              Computer gooit…
            </span>
          </div>
        )}
        <div className={`transition-opacity ${activeIsCpu ? 'opacity-40 pointer-events-none' : ''}`}>
          <Keypad
            value={inputValue}
            onChange={setInputValue}
            onConfirm={handleKeypadConfirm}
            onNoScore={() => handleSubmit(0)}
            onUndo={handleUndo}
            canUndo={game.canUndo}
            isBust={bustFlash}
          />
        </div>
      </div>

      {/* Modals */}
      {pendingCheckout !== null && (
        <CheckoutModal
          playerName={players[active]}
          onConfirm={handleCheckoutConfirm}
          onCancel={() => setPendingCheckout(null)}
        />
      )}
      {showHistory && (
        <HistoryModal
          players={players}
          visits={game.visits}
          currentLeg={game.currentLeg}
          currentSet={game.currentSet}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
