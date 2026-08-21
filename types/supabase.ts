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
