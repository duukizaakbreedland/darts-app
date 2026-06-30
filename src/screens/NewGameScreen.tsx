import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnScreenKeyboard } from '../components/OnScreenKeyboard'

const STARTING_SCORES = [301, 501, 701]

export function NewGameScreen() {
  const navigate = useNavigate()
  const [startingScore, setStartingScore] = useState(501)
  const [legs, setLegs] = useState(3)
  const [sets, setSets] = useState(1)
  const [players, setPlayers] = useState(['Duuk', ''])
  const [activeField, setActiveField] = useState<number | null>(null)

  const addPlayer = () => {
    if (players.length < 4) setPlayers([...players, ''])
  }

  const updatePlayer = (i: number, name: string) => {
    const next = [...players]
    next[i] = name
    setPlayers(next)
  }

  const removePlayer = (i: number) => {
    setPlayers(players.filter((_, idx) => idx !== i))
  }

  const canStart = players.filter(p => p.trim()).length >= 2

  const handleStart = () => {
    const validPlayers = players.filter(p => p.trim())
    navigate('/game', {
      state: { startingScore, legs, sets, players: validPlayers }
    })
  }

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-5 gap-6 pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      <div className="pt-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 transition-colors">
          ←
        </button>
        <h1 className="text-2xl font-bold text-slate-100">Nieuw spel</h1>
      </div>

      {/* Starting score */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Score</span>
        <div className="flex gap-2">
          {STARTING_SCORES.map(s => (
            <button
              key={s}
              onClick={() => setStartingScore(s)}
              className={`flex-1 h-12 rounded-xl font-bold text-lg transition-colors ${
                startingScore === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Legs & Sets */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Legs', value: legs, set: setLegs, min: 1, max: 9, step: 2 },
          { label: 'Sets', value: sets, set: setSets, min: 1, max: 7, step: 2 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">{label}</span>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => set(v => Math.max(min, v - step))}
                className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center"
              >
                −
              </button>
              <span className="flex-1 text-center text-xl font-bold text-slate-100">{value}</span>
              <button
                onClick={() => set(v => Math.min(max, v + step))}
                className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Players */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Spelers</span>
        <div className="flex flex-col gap-2">
          {players.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                {i + 1}
              </div>
              <button
                onClick={() => setActiveField(i)}
                className={`flex-1 text-left bg-slate-800 border rounded-xl px-4 h-12 transition-colors ${
                  activeField === i ? 'border-blue-500' : 'border-slate-700'
                } ${name ? 'text-slate-100' : 'text-slate-600'}`}
              >
                {name || `Speler ${i + 1}`}
              </button>
              {i >= 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {players.length < 4 && (
            <button
              onClick={addPlayer}
              className="h-12 rounded-xl border border-dashed border-slate-700 text-slate-600 text-sm hover:border-slate-500 hover:text-slate-400 transition-colors"
            >
              + Speler toevoegen
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${
            canStart
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
              : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
          }`}
        >
          Spel starten
        </button>
      </div>

      {activeField !== null && (
        <OnScreenKeyboard
          label={`Speler ${activeField + 1}`}
          value={players[activeField]}
          onChange={name => updatePlayer(activeField, name)}
          onClose={() => setActiveField(null)}
        />
      )}
    </div>
  )
}
