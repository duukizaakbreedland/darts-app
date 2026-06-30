import type { Database } from './supabase'

export type { Database }

export type GameType = 'x01' | 'cricket' | 'around_the_clock' | 'shanghai' | 'checkout_training'
export type GameStatus = 'active' | 'completed' | 'abandoned'

export interface GameSettings {
  startingScore?: number
  doubleIn?: boolean
  doubleOut?: boolean
  legs?: number
  sets?: number
}

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Player = Pick<Row<'players'>, 'id' | 'name'>
