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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cronograma_itens: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          etapa: string
          id: string
          percentual_conclusao: number
          plano_trabalho_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          etapa: string
          id?: string
          percentual_conclusao?: number
          plano_trabalho_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          etapa?: string
          id?: string
          percentual_conclusao?: number
          plano_trabalho_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_itens_plano_trabalho_id_fkey"
            columns: ["plano_trabalho_id"]
            isOneToOne: false
            referencedRelation: "planos_trabalho"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          created_at: string
          emenda_id: string | null
          id: string
          nome: string
          plano_trabalho_id: string | null
          tipo: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          emenda_id?: string | null
          id?: string
          nome: string
          plano_trabalho_id?: string | null
          tipo: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          emenda_id?: string | null
          id?: string
          nome?: string
          plano_trabalho_id?: string | null
          tipo?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_emenda_id_fkey"
            columns: ["emenda_id"]
            isOneToOne: false
            referencedRelation: "emendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_plano_trabalho_id_fkey"
            columns: ["plano_trabalho_id"]
            isOneToOne: false
            referencedRelation: "planos_trabalho"
            referencedColumns: ["id"]
          },
        ]
      }
      emendas: {
        Row: {
          anuencia_previa_sus: boolean | null
          banco: string | null
          cnpj_recebedor: string
          conta_corrente: string | null
          contrapartida: number | null
          created_at: string
          created_by: string | null
          data_disponibilizacao: string
          estado: string
          gestor_responsavel: string
          grupo_natureza_despesa: string
          id: string
          municipio: string
          nome_concedente: string | null
          nome_parlamentar: string | null
          nome_recebedor: string
          numero: string
          numero_convenio: string | null
          numero_plano_acao: string | null
          numero_proposta: string | null
          objeto: string
          prefeitura_id: string | null
          status: Database["public"]["Enums"]["status_emenda"]
          tipo_concedente: Database["public"]["Enums"]["tipo_concedente"]
          tipo_recebedor: Database["public"]["Enums"]["tipo_recebedor"]
          updated_at: string
          valor: number
          valor_executado: number
        }
        Insert: {
          anuencia_previa_sus?: boolean | null
          banco?: string | null
          cnpj_recebedor: string
          conta_corrente?: string | null
          contrapartida?: number | null
          created_at?: string
          created_by?: string | null
          data_disponibilizacao: string
          estado?: string
          gestor_responsavel: string
          grupo_natureza_despesa: string
          id?: string
          municipio: string
          nome_concedente?: string | null
          nome_parlamentar?: string | null
          nome_recebedor: string
          numero: string
          numero_convenio?: string | null
          numero_plano_acao?: string | null
          numero_proposta?: string | null
          objeto: string
          prefeitura_id?: string | null
          status?: Database["public"]["Enums"]["status_emenda"]
          tipo_concedente: Database["public"]["Enums"]["tipo_concedente"]
          tipo_recebedor: Database["public"]["Enums"]["tipo_recebedor"]
          updated_at?: string
          valor: number
          valor_executado?: number
        }
        Update: {
          anuencia_previa_sus?: boolean | null
          banco?: string | null
          cnpj_recebedor?: string
          conta_corrente?: string | null
          contrapartida?: number | null
          created_at?: string
          created_by?: string | null
          data_disponibilizacao?: string
          estado?: string
          gestor_responsavel?: string
          grupo_natureza_despesa?: string
          id?: string
          municipio?: string
          nome_concedente?: string | null
          nome_parlamentar?: string | null
          nome_recebedor?: string
          numero?: string
          numero_convenio?: string | null
          numero_plano_acao?: string | null
          numero_proposta?: string | null
          objeto?: string
          prefeitura_id?: string | null
          status?: Database["public"]["Enums"]["status_emenda"]
          tipo_concedente?: Database["public"]["Enums"]["tipo_concedente"]
          tipo_recebedor?: Database["public"]["Enums"]["tipo_recebedor"]
          updated_at?: string
          valor?: number
          valor_executado?: number
        }
        Relationships: [
          {
            foreignKeyName: "emendas_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas_licitacao: {
        Row: {
          cnpj: string
          created_at: string
          created_by: string | null
          emenda_id: string
          id: string
          nome_empresa: string
          numero_empenho: string
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          created_by?: string | null
          emenda_id: string
          id?: string
          nome_empresa: string
          numero_empenho: string
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          created_by?: string | null
          emenda_id?: string
          id?: string
          nome_empresa?: string
          numero_empenho?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_licitacao_emenda_id_fkey"
            columns: ["emenda_id"]
            isOneToOne: false
            referencedRelation: "emendas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          created_by: string | null
          data_pagamento: string
          descricao: string | null
          empresa_id: string
          id: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_pagamento: string
          descricao?: string | null
          empresa_id: string
          id?: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_licitacao"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_trabalho: {
        Row: {
          created_at: string
          created_by: string | null
          emenda_id: string
          estimativa_recursos: number
          finalidade: string
          id: string
          objeto: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          emenda_id: string
          estimativa_recursos: number
          finalidade: string
          id?: string
          objeto: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          emenda_id?: string
          estimativa_recursos?: number
          finalidade?: string
          id?: string
          objeto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_trabalho_emenda_id_fkey"
            columns: ["emenda_id"]
            isOneToOne: false
            referencedRelation: "emendas"
            referencedColumns: ["id"]
          },
        ]
      }
      prefeituras: {
        Row: {
          ativo: boolean
          cnpj: string | null
          created_at: string
          estado: string
          id: string
          logo_url: string | null
          municipio: string
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          estado?: string
          id?: string
          logo_url?: string | null
          municipio: string
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          estado?: string
          id?: string
          logo_url?: string | null
          municipio?: string
          nome?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nome_completo: string
          orgao_setor: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome_completo: string
          orgao_setor?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome_completo?: string
          orgao_setor?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          prefeitura_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prefeitura_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prefeitura_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_prefeitura_id_fkey"
            columns: ["prefeitura_id"]
            isOneToOne: false
            referencedRelation: "prefeituras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_prefeitura: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_prefeitura: {
        Args: { _prefeitura_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "prefeitura_admin" | "prefeitura_user"
      status_emenda:
        | "pendente"
        | "aprovado"
        | "em_execucao"
        | "concluido"
        | "cancelado"
      tipo_concedente: "parlamentar" | "comissao" | "bancada" | "outro"
      tipo_recebedor:
        | "administracao_publica"
        | "entidade_sem_fins_lucrativos"
        | "consorcio_publico"
        | "pessoa_juridica_privada"
        | "outro"
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
    Enums: {
      app_role: ["super_admin", "prefeitura_admin", "prefeitura_user"],
      status_emenda: [
        "pendente",
        "aprovado",
        "em_execucao",
        "concluido",
        "cancelado",
      ],
      tipo_concedente: ["parlamentar", "comissao", "bancada", "outro"],
      tipo_recebedor: [
        "administracao_publica",
        "entidade_sem_fins_lucrativos",
        "consorcio_publico",
        "pessoa_juridica_privada",
        "outro",
      ],
    },
  },
} as const
