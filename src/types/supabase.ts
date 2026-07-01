export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      game_players: {
        Row: {
          game_id: string
          id: string
          order_num: number
          player_id: string
        }
        Insert: {
          game_id: string
          id?: string
          order_num: number
          player_id: string
        }
        Update: {
          game_id?: string
          id?: string
          order_num?: number
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          metrics: Json
          player_id: string
          score: number | null
          won: boolean
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          metrics?: Json
          player_id: string
          score?: number | null
          won?: boolean
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          metrics?: Json
          player_id?: string
          score?: number | null
          won?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "game_results_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          completed_at: string | null
          created_at: string | null
          game_type: string
          id: string
          settings: Json
          status: string
          winner_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          game_type: string
          id?: string
          settings?: Json
          status?: string
          winner_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          game_type?: string
          id?: string
          settings?: Json
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      legs: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          leg_number: number
          set_id: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          leg_number: number
          set_id?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          leg_number?: number
          set_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legs_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legs_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          game_id: string
          id: string
          set_number: number
          winner_id: string | null
        }
        Insert: {
          game_id: string
          id?: string
          set_number: number
          winner_id?: string | null
        }
        Update: {
          game_id?: string
          id?: string
          set_number?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      turns: {
        Row: {
          created_at: string | null
          dart1: number | null
          dart2: number | null
          dart3: number | null
          id: string
          is_bust: boolean
          is_checkout: boolean
          leg_id: string
          player_id: string
          remaining_after: number
          remaining_before: number
          round_number: number
          score: number
        }
        Insert: {
          created_at?: string | null
          dart1?: number | null
          dart2?: number | null
          dart3?: number | null
          id?: string
          is_bust?: boolean
          is_checkout?: boolean
          leg_id: string
          player_id: string
          remaining_after: number
          remaining_before: number
          round_number: number
          score: number
        }
        Update: {
          created_at?: string | null
          dart1?: number | null
          dart2?: number | null
          dart3?: number | null
          id?: string
          is_bust?: boolean
          is_checkout?: boolean
          leg_id?: string
          player_id?: string
          remaining_after?: number
          remaining_before?: number
          round_number?: number
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "turns_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turns_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
