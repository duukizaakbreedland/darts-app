import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnScreenKeyboard } from '../components/OnScreenKeyboard'
import {
  fetchPlayers,
  createPlayer,
  renamePlayer,
  deletePlayer,
  isDuplicateError,
} from '../lib/players'
import type { Player } from '../types/database'

type Editing = { mode: 'add' } | { mode: 'edit'; player: Player } | null

export function ProfilesScreen() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)
  const [pendingDelete, setPendingDelete] = useState<Player | null>(null)

  const reload = async () => {
    try {
      setPlayers(await fetchPlayers())
    } catch {
      setError('Kon profielen niet laden. Controleer je internetverbinding.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const handleSave = async (value: string) => {
    const name = value.trim()
    const current = editing
    setEditing(null)
    if (!name || !current) return
    setBusy(true)
    setError(null)
    try {
      if (current.mode === 'add') await createPlayer(name)
      else await renamePlayer(current.player.id, name)
      await reload()
    } catch (e) {
      setError(
        isDuplicateError(e)
          ? `Er bestaat al een profiel met de naam "${name}".`
          : 'Opslaan mislukt. Probeer het opnieuw.'
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (player: Player) => {
    setPendingDelete(null)
    setBusy(true)
    setError(null)
    try {
      await deletePlayer(player.id)
      await reload()
    } catch {
      setError('Verwijderen mislukt. Probeer het opnieuw.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-6 gap-5 pt-[calc(env(safe-area-inset-top)_+_0.5rem)]">
      {/* Header */}
      <div className="relative flex items-center h-11">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1 h-11 px-3 -ml-3 rounded-lg text-slate-300 active:bg-slate-800 transition-colors"
        >
          <span className="text-2xl leading-none">‹</span>
          <span className="text-sm font-medium">Terug</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-100 pointer-events-none">
          Profielen
        </h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Lijst */}
      {loading ? (
        <p className="text-slate-500 text-sm text-center py-10">Laden…</p>
      ) : players.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm">Nog geen profielen.</p>
          <p className="text-slate-600 text-xs mt-1">Voeg je eerste speler toe.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <button
                onClick={() => setEditing({ mode: 'edit', player: p })}
                className="flex-1 text-left bg-slate-800 border border-slate-700 rounded-xl px-4 h-12 text-slate-100 active:bg-slate-700 transition-colors"
              >
                {p.name}
              </button>
              <button
                onClick={() => setPendingDelete(p)}
                disabled={busy}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center active:bg-slate-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toevoegen */}
      <div className="mt-auto">
        <button
          onClick={() => setEditing({ mode: 'add' })}
          disabled={busy}
          className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-lg font-bold shadow-lg shadow-blue-900/40 transition-colors disabled:opacity-50"
        >
          + Speler toevoegen
        </button>
      </div>

      {/* Toetsenbord voor naam */}
      {editing && (
        <OnScreenKeyboard
          label={editing.mode === 'add' ? 'Nieuwe speler' : 'Naam wijzigen'}
          initialValue={editing.mode === 'edit' ? editing.player.name : ''}
          onClose={handleSave}
        />
      )}

      {/* Verwijder-bevestiging */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xs flex flex-col gap-4 p-6 shadow-2xl">
            <div className="text-center">
              <h2 className="text-slate-100 font-bold text-lg">Profiel verwijderen?</h2>
              <p className="text-slate-500 text-sm mt-1">
                "{pendingDelete.name}" wordt definitief verwijderd.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 h-12 rounded-xl bg-slate-700 text-slate-200 font-semibold active:bg-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(pendingDelete)}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold active:bg-red-700"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
