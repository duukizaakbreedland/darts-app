import { supabase } from './supabase'
import type { Player } from '../types/database'

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('id, name')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createPlayer(name: string): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({ name })
    .select('id, name')
    .single()
  if (error) throw error
  return data
}

export async function renamePlayer(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('players').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

/** Postgres unique-violation foutcode (dubbele naam). */
export function isDuplicateError(e: unknown): boolean {
  const code = (e as { code?: string })?.code
  const message = (e as { message?: string })?.message ?? ''
  return code === '23505' || message.toLowerCase().includes('duplicate')
}
