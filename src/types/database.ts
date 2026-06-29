export type GameType = 'x01' | 'cricket' | 'around_the_clock' | 'shanghai' | 'checkout_training'
export type GameStatus = 'active' | 'completed' | 'abandoned'

export interface Database {
  public: {
    Tables: {
      players: {
        Row: { id: string; name: string; created_at: string }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string }
      }
      games: {
        Row: { id: string; game_type: GameType; settings: GameSettings; status: GameStatus; winner_id: string | null; created_at: string; completed_at: string | null }
        Insert: { id?: string; game_type: GameType; settings?: GameSettings; status?: GameStatus; winner_id?: string | null }
        Update: { status?: GameStatus; winner_id?: string | null; completed_at?: string | null }
      }
      game_players: {
        Row: { id: string; game_id: string; player_id: string; order_num: number }
        Insert: { id?: string; game_id: string; player_id: string; order_num: number }
        Update: never
      }
      sets: {
        Row: { id: string; game_id: string; set_number: number; winner_id: string | null }
        Insert: { id?: string; game_id: string; set_number: number; winner_id?: string | null }
        Update: { winner_id?: string | null }
      }
      legs: {
        Row: { id: string; game_id: string; set_id: string | null; leg_number: number; winner_id: string | null; created_at: string }
        Insert: { id?: string; game_id: string; set_id?: string | null; leg_number: number; winner_id?: string | null }
        Update: { winner_id?: string | null }
      }
      turns: {
        Row: { id: string; leg_id: string; player_id: string; round_number: number; score: number; dart1: number | null; dart2: number | null; dart3: number | null; remaining_before: number; remaining_after: number; is_bust: boolean; is_checkout: boolean; created_at: string }
        Insert: { id?: string; leg_id: string; player_id: string; round_number: number; score: number; dart1?: number | null; dart2?: number | null; dart3?: number | null; remaining_before: number; remaining_after: number; is_bust?: boolean; is_checkout?: boolean }
        Update: never
      }
    }
  }
}

export interface GameSettings {
  startingScore?: number
  doubleIn?: boolean
  doubleOut?: boolean
  legs?: number
  sets?: number
}

export interface Player {
  id: string
  name: string
}

export interface Turn {
  playerId: string
  score: number
  remainingBefore: number
  remainingAfter: number
  isBust: boolean
  isCheckout: boolean
}
