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
      bathroom_photo_scans: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          model: string | null
          overall_summary: string | null
          photo_id: string
          project_id: string
          raw_response: Json | null
          signals: Json
          status: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string | null
          overall_summary?: string | null
          photo_id: string
          project_id: string
          raw_response?: Json | null
          signals?: Json
          status?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string | null
          overall_summary?: string | null
          photo_id?: string
          project_id?: string
          raw_response?: Json | null
          signals?: Json
          status?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bathroom_photo_scans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          active: boolean
          best_for: string | null
          brand: string | null
          category: string
          compatibility_tags: string[] | null
          created_at: string
          depth: number | null
          featured: boolean
          finish: string | null
          height: number | null
          id: string
          image_url: string | null
          install_notes: string | null
          price: number | null
          price_note: string | null
          product_url: string | null
          retailer: string | null
          room_type: string
          short_description: string | null
          style_tags: string[] | null
          title: string
          updated_at: string
          width: number | null
        }
        Insert: {
          active?: boolean
          best_for?: string | null
          brand?: string | null
          category: string
          compatibility_tags?: string[] | null
          created_at?: string
          depth?: number | null
          featured?: boolean
          finish?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          install_notes?: string | null
          price?: number | null
          price_note?: string | null
          product_url?: string | null
          retailer?: string | null
          room_type?: string
          short_description?: string | null
          style_tags?: string[] | null
          title: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          active?: boolean
          best_for?: string | null
          brand?: string | null
          category?: string
          compatibility_tags?: string[] | null
          created_at?: string
          depth?: number | null
          featured?: boolean
          finish?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          install_notes?: string | null
          price?: number | null
          price_note?: string | null
          product_url?: string | null
          retailer?: string | null
          room_type?: string
          short_description?: string | null
          style_tags?: string[] | null
          title?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      project_saved_products: {
        Row: {
          category: string
          created_at: string
          id: string
          notes: string | null
          product_id: string
          project_id: string
          source: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          project_id: string
          source?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          project_id?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_saved_products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          agreement_data: Json | null
          bathroom_type: string | null
          created_at: string
          customizations: Json | null
          dimensions: Json | null
          id: string
          name: string
          property_type: string | null
          selected_package: Json | null
          status: string
          style_preferences: Json | null
          updated_at: string
          user_id: string
          workflow_progress: Json | null
        }
        Insert: {
          agreement_data?: Json | null
          bathroom_type?: string | null
          created_at?: string
          customizations?: Json | null
          dimensions?: Json | null
          id?: string
          name?: string
          property_type?: string | null
          selected_package?: Json | null
          status?: string
          style_preferences?: Json | null
          updated_at?: string
          user_id: string
          workflow_progress?: Json | null
        }
        Update: {
          agreement_data?: Json | null
          bathroom_type?: string | null
          created_at?: string
          customizations?: Json | null
          dimensions?: Json | null
          id?: string
          name?: string
          property_type?: string | null
          selected_package?: Json | null
          status?: string
          style_preferences?: Json | null
          updated_at?: string
          user_id?: string
          workflow_progress?: Json | null
        }
        Relationships: []
      }
      remodel_design_events: {
        Row: {
          created_at: string
          design_id: string
          event_type: string
          id: number
          payload: Json
        }
        Insert: {
          created_at?: string
          design_id: string
          event_type: string
          id?: number
          payload?: Json
        }
        Update: {
          created_at?: string
          design_id?: string
          event_type?: string
          id?: number
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "remodel_design_events_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "remodel_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      remodel_designs: {
        Row: {
          completed_steps: string[]
          created_at: string
          current_step: string | null
          deleted_at: string | null
          id: string
          last_active_at: string
          name: string
          package_version: number | null
          pricing: Json
          resolved_state: Json
          saved_at: string | null
          schema_version: number
          selected_package_id: string | null
          selected_style: string | null
          selected_tier: string | null
          selections: Json
          status: string
          updated_at: string
          user_id: string | null
          validation: Json
        }
        Insert: {
          completed_steps?: string[]
          created_at?: string
          current_step?: string | null
          deleted_at?: string | null
          id?: string
          last_active_at?: string
          name?: string
          package_version?: number | null
          pricing?: Json
          resolved_state?: Json
          saved_at?: string | null
          schema_version?: number
          selected_package_id?: string | null
          selected_style?: string | null
          selected_tier?: string | null
          selections?: Json
          status?: string
          updated_at?: string
          user_id?: string | null
          validation?: Json
        }
        Update: {
          completed_steps?: string[]
          created_at?: string
          current_step?: string | null
          deleted_at?: string | null
          id?: string
          last_active_at?: string
          name?: string
          package_version?: number | null
          pricing?: Json
          resolved_state?: Json
          saved_at?: string | null
          schema_version?: number
          selected_package_id?: string | null
          selected_style?: string | null
          selected_tier?: string | null
          selections?: Json
          status?: string
          updated_at?: string
          user_id?: string | null
          validation?: Json
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_catalog_product: { Args: { p_product_id: string }; Returns: Json }
      get_project_context: { Args: { p_project_id: string }; Returns: Json }
      list_saved_project_products: {
        Args: { p_project_id: string }
        Returns: Json
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      save_product_to_project: {
        Args: {
          p_notes?: string
          p_product_id: string
          p_project_id: string
          p_source?: string
        }
        Returns: Json
      }
      search_catalog_products: { Args: { filters?: Json }; Returns: Json }
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
