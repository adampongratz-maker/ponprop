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
      calendar_events: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          property: string | null
          status: string
          time: string | null
          title: string
          type: string
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          property?: string | null
          status?: string
          time?: string | null
          title: string
          type?: string
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          property?: string | null
          status?: string
          time?: string | null
          title?: string
          type?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          qty: number
          reorder_at: number
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          qty?: number
          reorder_at?: number
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          qty?: number
          reorder_at?: number
          user_id?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          method: string | null
          property: string | null
          tenant: string | null
          type: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          method?: string | null
          property?: string | null
          tenant?: string | null
          type: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          method?: string | null
          property?: string | null
          tenant?: string | null
          type?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rental_history: {
        Row: {
          created_at: string
          id: string
          move_in: string | null
          move_out: string | null
          property: string
          status: string
          tenant: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          move_in?: string | null
          move_out?: string | null
          property: string
          status?: string
          tenant: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          move_in?: string | null
          move_out?: string | null
          property?: string
          status?: string
          tenant?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          completed_at: string | null
          created_at: string
          date: string | null
          id: string
          priority: string
          status: string
          text: string
          time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string
          date?: string | null
          id?: string
          priority?: string
          status?: string
          text: string
          time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string
          date?: string | null
          id?: string
          priority?: string
          status?: string
          text?: string
          time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: string
          status: string
          due_date: string | null
          property_id: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: string
          status?: string
          due_date?: string | null
          property_id?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: string
          status?: string
          due_date?: string | null
          property_id?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          balance: number | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          property: string | null
          status: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          property?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          property?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          assigned_to: string | null
          created_at: string
          due_date: string | null
          id: string
          issue: string
          priority: string
          property: string
          status: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          issue: string
          priority?: string
          property: string
          status?: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          issue?: string
          priority?: string
          property?: string
          status?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          status: string
          units: number
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string
          units?: number
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string
          units?: number
          user_id?: string
        }
        Relationships: []
      }
      property_units: {
        Row: {
          created_at: string
          id: string
          property_name: string
          rent: number
          status: string
          tenant_name: string | null
          unit_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_name: string
          rent?: number
          status?: string
          tenant_name?: string | null
          unit_number: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_name?: string
          rent?: number
          status?: string
          tenant_name?: string | null
          unit_number?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number
          created_at: string
          due_date: string | null
          id: string
          name: string
          property: string
          start_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          budget?: number
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          property: string
          start_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          budget?: number
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          property?: string
          start_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          created_at: string
          done: boolean
          id: string
          name: string
          qty: number
          store: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          name: string
          qty?: number
          store?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          name?: string
          qty?: number
          store?: string | null
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
