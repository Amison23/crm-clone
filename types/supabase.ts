export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          email_address: string
          full_name: string | null
          role: string
          company_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email_address: string
          full_name?: string | null
          role?: string
          company_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email_address?: string
          full_name?: string | null
          role?: string
          company_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          company_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          company_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          company_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          company_id: string
          employee_id: string | null
          first_name: string
          last_name: string
          company_name: string | null
          email: string | null
          phone: string
          source: string | null
          status: string
          potential_value: number | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          employee_id?: string | null
          first_name: string
          last_name: string
          company_name?: string | null
          email?: string | null
          phone: string
          source?: string | null
          status?: string
          potential_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          employee_id?: string | null
          first_name?: string
          last_name?: string
          company_name?: string | null
          email?: string | null
          phone?: string
          source?: string | null
          status?: string
          potential_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          company_id: string
          assigned_to: string | null
          created_by: string | null
          title: string
          description: string | null
          status: string
          due_date: string
          created_at: string
          updated_at: string | null
          archived_at: string | null
          archived_by: string | null
          unarchive_used: boolean
          unarchive_count: number
          max_unarchives: number
        }
        Insert: {
          id?: string
          company_id: string
          assigned_to?: string | null
          created_by?: string | null
          title: string
          description?: string | null
          status?: string
          due_date: string
          created_at?: string
          updated_at?: string | null
          archived_at?: string | null
          archived_by?: string | null
          unarchive_used?: boolean
          unarchive_count?: number
          max_unarchives?: number
        }
        Update: {
          id?: string
          company_id?: string
          assigned_to?: string | null
          created_by?: string | null
          title?: string
          description?: string | null
          status?: string
          due_date?: string
          created_at?: string
          updated_at?: string | null
          archived_at?: string | null
          archived_by?: string | null
          unarchive_used?: boolean
          unarchive_count?: number
          max_unarchives?: number
        }
        Relationships: []
      }
      task_feedback: {
        Row: {
          id: string
          task_id: string
          author_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          company_id: string
          client_id: string | null
          assigned_to: string | null
          title: string
          description: string | null
          status: string
          priority: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          client_id?: string | null
          assigned_to?: string | null
          title: string
          description?: string | null
          status?: string
          priority?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          client_id?: string | null
          assigned_to?: string | null
          title?: string
          description?: string | null
          status?: string
          priority?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          company_id: string
          sender_id: string
          receiver_id: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          sender_id: string
          receiver_id?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          sender_id?: string
          receiver_id?: string | null
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          api_key: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          api_key?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          api_key?: string | null
          created_at?: string
        }
        Relationships: []
      }
      agent_products: {
        Row: {
          id: string
          agent_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          role: string
          module: string
          can_read: boolean
          can_write: boolean
          can_delete: boolean
          can_export: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          role: string
          module: string
          can_read?: boolean
          can_write?: boolean
          can_delete?: boolean
          can_export?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          module?: string
          can_read?: boolean
          can_write?: boolean
          can_delete?: boolean
          can_export?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          value: Json
          category: string | null
          description: string | null
          updated_at: string | null
        }
        Insert: {
          key: string
          value: Json
          category?: string | null
          description?: string | null
          updated_at?: string | null
        }
        Update: {
          key?: string
          value?: Json
          category?: string | null
          description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          id: string
          tenant_id: string
          recorded_at: string
          leads_count: number
          conversion_rate: number
          tasks_completed_count: number
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          recorded_at: string
          leads_count?: number
          conversion_rate?: number
          tasks_completed_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          recorded_at?: string
          leads_count?: number
          conversion_rate?: number
          tasks_completed_count?: number
          created_at?: string
        }
        Relationships: []
      }
      gateways: {
        Row: {
          id: string
          name: string
          ip_address: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          ip_address: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          ip_address?: string
          created_at?: string
        }
        Relationships: []
      }
      sim_ports: {
        Row: {
          id: string
          phone_number: string
          company_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          phone_number: string
          company_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          phone_number?: string
          company_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      virtual_numbers: {
        Row: {
          id: string
          number: string
          company_id: string | null
          sim_port_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          number: string
          company_id?: string | null
          sim_port_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          number?: string
          company_id?: string | null
          sim_port_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      connected_email_accounts: {
        Row: {
          id: string
          company_id: string
          employee_id: string
          provider: string
          provider_account_id: string
          email_address: string
          display_name: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          scopes: string | null
          sync_status: string | null
          sync_cursor: string | null
          last_successful_sync: string | null
          last_sync_error: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          employee_id: string
          provider: string
          provider_account_id: string
          email_address: string
          display_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          scopes?: string | null
          sync_status?: string | null
          sync_cursor?: string | null
          last_successful_sync?: string | null
          last_sync_error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          employee_id?: string
          provider?: string
          provider_account_id?: string
          email_address?: string
          display_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          scopes?: string | null
          sync_status?: string | null
          sync_cursor?: string | null
          last_successful_sync?: string | null
          last_sync_error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_email_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connected_email_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      email_messages: {
        Row: {
          id: string
          company_id: string
          connected_account_id: string
          provider_message_id: string
          provider_thread_id: string | null
          internet_message_id: string | null
          direction: string
          subject: string | null
          body_preview: string | null
          sent_at: string | null
          received_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          connected_account_id: string
          provider_message_id: string
          provider_thread_id?: string | null
          internet_message_id?: string | null
          direction: string
          subject?: string | null
          body_preview?: string | null
          sent_at?: string | null
          received_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          connected_account_id?: string
          provider_message_id?: string
          provider_thread_id?: string | null
          internet_message_id?: string | null
          direction?: string
          subject?: string | null
          body_preview?: string | null
          sent_at?: string | null
          received_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: false
            referencedRelation: "connected_email_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      email_participants: {
        Row: {
          id: string
          company_id: string
          email_message_id: string
          participant_type: string
          email_address: string
          display_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          email_message_id: string
          participant_type: string
          email_address: string
          display_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          email_message_id?: string
          participant_type?: string
          email_address?: string
          display_name?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_participants_email_message_id_fkey"
            columns: ["email_message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          }
        ]
      }
      email_crm_relations: {
        Row: {
          id: string
          company_id: string
          email_message_id: string
          entity_type: string
          entity_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          email_message_id: string
          entity_type: string
          entity_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          email_message_id?: string
          entity_type?: string
          entity_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_crm_relations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_crm_relations_email_message_id_fkey"
            columns: ["email_message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          }
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
