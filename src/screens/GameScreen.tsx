import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PlayerScore } from '../components/PlayerScore'
import { Keypad } from '../components/Keypad'
import { CheckoutModal } from '../components/CheckoutModal'
import { HistoryModal } from '../components/HistoryModal'
import { getCheckout, isCheckoutable } from '../lib/checkouts'
import { useX01Game, playerAverage, legStats, lastVisit } from '../hooks/useX01Game'

interface NavState {
  players: string[]
  startingScore: number
  legs: number
  sets: number
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
  const active = game.activePlayer
  const activeScore = game.scores[active]

  // Naar game-over springen zodra er een winnaar is
  useEffect(() => {
    if (game.winner !== null) {
      navigate('/game-over', {
        state: { winner: players[game.winner], players, setsWon: game.setsWon },
      })
    }
  }, [game.winner])

  const handleSubmit = (points: number) => {
    if (points > 180 || points < 0 || bustFlash) return
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

  const handleCheckoutConfirm = (darts: number, double: string) => {
    if (pendingCheckout === null) return
    game.submit({ points: pendingCheckout, darts, checkout: true, double })
    setPendingCheckout(null)
    setInputValue('')
  }

  const handleUndo = () => {
    setInputValue('')
    setBustFlash(false)
    game.undo()
  }

  const checkout = isCheckoutable(activeScore) ? getCheckout(activeScore) : undefined

  return (
    <div className="flex flex-col h-svh bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← Terug
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-600 uppercase tracking-widest font-medium">
            Set {game.currentSet} · Leg {game.currentLeg}
          </div>
          <div className="text-sm font-bold text-slate-200">{nav.startingScore} · Double Out</div>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ☰
        </button>
      </div>

      {/* Speler-scores */}
      <div className="flex">
        {players.map((name, i) => {
          const stats = legStats(game.visits, i, game.currentLeg, game.currentSet)
          const lv = lastVisit(game.visits, i, game.currentLeg, game.currentSet)
          return (
            <PlayerScore
              key={i}
              name={name}
              score={game.scores[i]}
              setsWon={game.setsWon[i]}
              legsWon={game.legsWon[i]}
              avg={playerAverage(game.visits, i)}
              rounds={stats.rounds}
              darts={stats.darts}
              isActive={active === i}
              lastScore={lv ? lv.points : null}
              lastBust={lv ? lv.bust : false}
            />
          )
        })}
      </div>

      {/* Checkout / beurt-indicator */}
      <div className="h-12 flex items-center justify-center border-b border-slate-800">
        {checkout ? (
          <span className="text-2xl font-bold text-emerald-400 tracking-wide leading-none">{checkout}</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
              {players[active]} aan de beurt
            </span>
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="mt-auto">
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

      {/* Modals */}
      {pendingCheckout !== null && (
        <CheckoutModal
          playerName={players[active]}
          remaining={activeScore}
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
