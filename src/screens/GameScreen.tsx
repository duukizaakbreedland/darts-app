import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PlayerScore } from '../components/PlayerScore'
import { Keypad } from '../components/Keypad'
import { getCheckout, isCheckoutRange } from '../lib/checkouts'

interface GameState {
  players: string[]
  startingScore: number
  legs: number
  sets: number
}

export function GameScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { players, startingScore, legs: legsToWin, sets: setsToWin } = (location.state as GameState) ?? {
    players: ['Duuk', 'CPU'], startingScore: 501, legs: 3, sets: 1
  }

  const [activePlayer, setActivePlayer] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isBust, setIsBust] = useState(false)
  const [scores, setScores] = useState<number[]>(players.map(() => startingScore))
  const [legsWon, setLegsWon] = useState<number[]>(players.map(() => 0))
  const [setsWon, setSetsWon] = useState<number[]>(players.map(() => 0))
  const [totalScored, setTotalScored] = useState<number[]>(players.map(() => 0))
  const [turnsPlayed, setTurnsPlayed] = useState<number[]>(players.map(() => 0))
  const [currentLeg, setCurrentLeg] = useState(1)
  const [currentSet, setCurrentSet] = useState(1)

  const avg = (i: number) =>
    turnsPlayed[i] === 0 ? 0 : (totalScored[i] / turnsPlayed[i]) * 3

  const handleConfirm = () => {
    const thrown = parseInt(inputValue)
    if (isNaN(thrown) || thrown > 180 || thrown < 0) return

    const remaining = scores[activePlayer] - thrown

    if (remaining < 0 || remaining === 1) {
      setIsBust(true)
      setTimeout(() => {
        setIsBust(false)
        setInputValue('')
        setActivePlayer(p => 1 - p)
      }, 900)
      return
    }

    const newScores = [...scores]
    const newTotalScored = [...totalScored]
    const newTurns = [...turnsPlayed]

    newTotalScored[activePlayer] += thrown
    newTurns[activePlayer] += 1

    if (remaining === 0) {
      // Leg win
      newScores[activePlayer] = startingScore
      const newLegs = [...legsWon]
      newLegs[activePlayer] += 1

      const neededLegs = Math.ceil(legsToWin / 2)
      if (newLegs[activePlayer] >= neededLegs) {
        // Set win
        const newSets = [...setsWon]
        newSets[activePlayer] += 1
        newLegs.fill(0)

        const neededSets = Math.ceil(setsToWin / 2)
        if (newSets[activePlayer] >= neededSets) {
          setSetsWon(newSets)
          setLegsWon(newLegs)
          setScores(newScores)
          navigate('/game-over', { state: { winner: players[activePlayer], players, setsWon: newSets } })
          return
        }
        setSetsWon(newSets)
        setCurrentSet(s => s + 1)
      }
      setLegsWon(newLegs)
      setCurrentLeg(l => l + 1)
      players.forEach((_, i) => { newScores[i] = startingScore })
    } else {
      newScores[activePlayer] = remaining
    }

    setScores(newScores)
    setTotalScored(newTotalScored)
    setTurnsPlayed(newTurns)
    setInputValue('')
    setActivePlayer(p => 1 - p)
  }

  return (
    <div className="flex flex-col h-svh bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← Terug
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-600 uppercase tracking-widest font-medium">
            Set {currentSet} · Leg {currentLeg}
          </div>
          <div className="text-sm font-bold text-slate-200">{startingScore} · Double Out</div>
        </div>
        <div className="w-12" />
      </div>

      {/* Player scores */}
      <div className="flex">
        {players.map((name, i) => (
          <PlayerScore
            key={i}
            name={name}
            score={scores[i]}
            setsWon={setsWon[i]}
            legsWon={legsWon[i]}
            avg={avg(i)}
            isActive={activePlayer === i}
            checkout={isCheckoutRange(scores[i]) ? getCheckout(scores[i]) : undefined}
          />
        ))}
      </div>

      {/* Turn indicator */}
      <div className="flex items-center justify-center py-2.5 gap-2 border-b border-slate-800">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
          {players[activePlayer]} aan de beurt
        </span>
      </div>

      {/* Keypad */}
      <div className="mt-auto">
        <Keypad
          value={inputValue}
          onChange={setInputValue}
          onConfirm={handleConfirm}
          onUndo={() => { setInputValue(''); setIsBust(false) }}
          isBust={isBust}
        />
      </div>
    </div>
  )
}
