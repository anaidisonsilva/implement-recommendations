import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  user_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[] | null;
  created_at: string;
}

export function useAuditLogs(filters?: {
  tableName?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;

  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (filters?.tableName && filters.tableName !== 'todos') {
        query = query.eq('table_name', filters.tableName);
      }
      if (filters?.action && filters.action !== 'todos') {
        query = query.eq('action', filters.action);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate + 'T23:59:59');
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data as unknown as AuditLog[]) || [], total: count || 0 };
    },
  });
}
