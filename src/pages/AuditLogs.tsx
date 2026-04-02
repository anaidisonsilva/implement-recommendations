import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, History, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AuditLog } from '@/hooks/useAuditLogs';

const tableLabels: Record<string, string> = {
  emendas: 'Emendas',
  empresas_licitacao: 'Empresas Licitadas',
  pagamentos: 'Pagamentos',
  planos_trabalho: 'Planos de Trabalho',
  documentos: 'Documentos',
};

const actionLabels: Record<string, string> = {
  INSERT: 'Criação',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
};

const actionColors: Record<string, string> = {
  INSERT: 'bg-emerald-100 text-emerald-800',
  UPDATE: 'bg-amber-100 text-amber-800',
  DELETE: 'bg-red-100 text-red-800',
};

const fieldLabels: Record<string, string> = {
  numero: 'Número',
  objeto: 'Objeto',
  valor: 'Valor',
  valor_executado: 'Valor Executado',
  contrapartida: 'Contrapartida',
  status: 'Status',
  nome_concedente: 'Concedente',
  nome_parlamentar: 'Parlamentar',
  nome_recebedor: 'Recebedor',
  cnpj_recebedor: 'CNPJ Recebedor',
  municipio: 'Município',
  estado: 'Estado',
  gestor_responsavel: 'Gestor Responsável',
  banco: 'Banco',
  conta_corrente: 'Conta Corrente',
  especial: 'Especial',
  anuencia_previa_sus: 'Anuência SUS',
  data_disponibilizacao: 'Data Disponibilização',
  data_inicio_vigencia: 'Início Vigência',
  data_fim_vigencia: 'Fim Vigência',
  nome_empresa: 'Empresa',
  cnpj: 'CNPJ',
  numero_empenho: 'Nº Empenho',
  data_pagamento: 'Data Pagamento',
  descricao: 'Descrição',
  finalidade: 'Finalidade',
  estimativa_recursos: 'Estimativa Recursos',
  nome: 'Nome',
  tipo: 'Tipo',
  url: 'URL',
  etapa: 'Etapa',
};

const AuditLogs = () => {
  const [tableName, setTableName] = useState('todos');
  const [action, setAction] = useState('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 25;

  const { data, isLoading } = useAuditLogs({
    tableName,
    action,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    pageSize,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getRecordLabel = (log: AuditLog) => {
    const data = log.new_data || log.old_data;
    if (!data) return log.record_id.slice(0, 8);
    if (data.numero) return `Nº ${data.numero}`;
    if (data.nome_empresa) return String(data.nome_empresa);
    if (data.nome) return String(data.nome);
    if (data.etapa) return String(data.etapa);
    return log.record_id.slice(0, 8);
  };

  const renderFieldValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'number') {
      if (value > 100) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      }
      return String(value);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <History className="h-6 w-6" />
          Auditoria e Logs
        </h1>
        <p className="text-muted-foreground">
          Histórico completo de alterações no sistema
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tabela</label>
              <Select value={tableName} onValueChange={(v) => { setTableName(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {Object.entries(tableLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ação</label>
              <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="INSERT">Criação</SelectItem>
                  <SelectItem value="UPDATE">Alteração</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros ({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Campos Alterados</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tableLabels[log.table_name] || log.table_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColors[log.action] || ''}`}>
                            {actionLabels[log.action] || log.action}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {getRecordLabel(log)}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-sm">
                          {log.changed_fields?.map(f => fieldLabels[f] || f).join(', ') || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Próxima
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Log
              {selectedLog && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColors[selectedLog.action] || ''}`}>
                  {actionLabels[selectedLog.action]}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tabela:</span>{' '}
                    <strong>{tableLabels[selectedLog.table_name] || selectedLog.table_name}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data:</span>{' '}
                    <strong>{formatDate(selectedLog.created_at)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registro:</span>{' '}
                    <strong>{getRecordLabel(selectedLog)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID:</span>{' '}
                    <code className="text-xs">{selectedLog.record_id}</code>
                  </div>
                </div>

                {selectedLog.action === 'UPDATE' && selectedLog.changed_fields && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">Campos Alterados</h4>
                    <div className="space-y-2">
                      {selectedLog.changed_fields.map(field => (
                        <div key={field} className="rounded-lg border p-3">
                          <p className="text-sm font-medium">{fieldLabels[field] || field}</p>
                          <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Antes: </span>
                              <span className="text-red-600">
                                {renderFieldValue(selectedLog.old_data?.[field])}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Depois: </span>
                              <span className="text-emerald-600">
                                {renderFieldValue(selectedLog.new_data?.[field])}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.action === 'INSERT' && selectedLog.new_data && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">Dados Criados</h4>
                    <div className="rounded-lg border p-3 space-y-1">
                      {Object.entries(selectedLog.new_data)
                        .filter(([k]) => !['id', 'created_at', 'updated_at', 'created_by'].includes(k))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{fieldLabels[key] || key}</span>
                            <span className="font-medium">{renderFieldValue(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedLog.action === 'DELETE' && selectedLog.old_data && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">Dados Excluídos</h4>
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-1">
                      {Object.entries(selectedLog.old_data)
                        .filter(([k]) => !['id', 'created_at', 'updated_at', 'created_by'].includes(k))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{fieldLabels[key] || key}</span>
                            <span className="font-medium text-red-700">{renderFieldValue(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
