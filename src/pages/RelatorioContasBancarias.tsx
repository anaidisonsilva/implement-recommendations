import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Landmark, Search } from 'lucide-react';
import { getFormaRepasseLabel } from '@/lib/formaRepasse';

type Row = {
  id: string;
  numero: string | null;
  numero_convenio: string | null;
  numero_plano_acao: string | null;
  numero_proposta: string | null;
  especial: boolean;
  forma_repasse: string | null;
  banco: string | null;
  conta_corrente: string | null;
  nome_recebedor: string;
  cnpj_recebedor: string;
  objeto: string;
  valor: number;
  valor_repassado: number;
  status: string;
};

const getForma = (e: Row) => getFormaRepasseLabel(e);

const escapeCSV = (v: string | number | null | undefined) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function RelatorioContasBancarias() {
  const [search, setSearch] = useState('');
  const [forma, setForma] = useState<string>('todos');

  const { data, isLoading } = useQuery({
    queryKey: ['contas-bancarias-relatorio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('id,numero,numero_convenio,numero_plano_acao,numero_proposta,especial,forma_repasse,banco,conta_corrente,nome_recebedor,cnpj_recebedor,objeto,valor,valor_repassado,status')
        .or('banco.not.is.null,conta_corrente.not.is.null')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    const rows = (data || []).filter(r => r.banco || r.conta_corrente);
    return rows.filter(r => {
      if (forma !== 'todos') {
        const f = getForma(r);
        if (forma === 'especial' && f !== 'Transferência Especial') return false;
        if (forma === 'convenio' && f !== 'Convênio') return false;
        if (forma === 'fundo' && f !== 'Fundo a Fundo') return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [r.banco, r.conta_corrente, r.numero, r.numero_convenio, r.numero_plano_acao, r.nome_recebedor, r.cnpj_recebedor, r.objeto]
        .some(v => v?.toLowerCase().includes(q));
    });
  }, [data, search, forma]);

  const exportCSV = () => {
    const headers = ['Banco','Conta Corrente','Forma de Repasse','Nº Emenda','Nº Convênio','Nº Plano de Ação','Nº Proposta','Recebedor','CNPJ','Objeto','Valor (R$)','Repassado (R$)','Status'];
    const rows = filtered.map(r => [
      r.banco, r.conta_corrente, getForma(r), r.numero, r.numero_convenio, r.numero_plano_acao, r.numero_proposta,
      r.nome_recebedor, r.cnpj_recebedor, r.objeto,
      Number(r.valor || 0).toFixed(2), Number(r.valor_repassado || 0).toFixed(2), r.status,
    ].map(escapeCSV).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contas-bancarias-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const fmt = (v: number) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const esc = (s: string | null | undefined) =>
      String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const filtros: string[] = [];
    if (search.trim()) filtros.push(`Busca: "${esc(search)}"`);
    if (forma !== 'todos') {
      const map: Record<string, string> = { especial: 'Transferência Especial', convenio: 'Convênio', fundo: 'Fundo a Fundo' };
      filtros.push(`Forma de Repasse: ${map[forma]}`);
    }
    const totalRepassado = filtered.reduce((s, r) => s + Number(r.valor_repassado || 0), 0);

    const rowsHtml = filtered.map(r => {
      const ids: string[] = [];
      if (r.numero_convenio) ids.push(`<div><span class="muted">Convênio:</span> ${esc(r.numero_convenio)}</div>`);
      if (r.numero_plano_acao) ids.push(`<div><span class="muted">Plano de Ação:</span> ${esc(r.numero_plano_acao)}</div>`);
      if (r.numero) ids.push(`<div><span class="muted">Emenda:</span> ${esc(r.numero)}</div>`);
      if (r.numero_proposta) ids.push(`<div><span class="muted">Proposta:</span> ${esc(r.numero_proposta)}</div>`);
      return `<tr>
        <td>${esc(r.banco) || '-'}</td>
        <td class="mono">${esc(r.conta_corrente) || '-'}</td>
        <td>${esc(getForma(r))}</td>
        <td>${ids.join('') || '-'}</td>
        <td>${esc(r.nome_recebedor)}<div class="muted mono small">${esc(r.cnpj_recebedor)}</div></td>
        <td class="right mono">${fmt(Number(r.valor_repassado || 0))}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório de Contas Bancárias</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #111; padding: 24px; font-size: 11pt; }
  h1 { margin: 0 0 4px; font-size: 18pt; }
  .sub { color: #666; font-size: 10pt; margin-bottom: 14px; }
  .meta { background: #f5f5f5; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 9.5pt; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  th { background: #1e40af; color: #fff; padding: 8px 6px; text-align: left; }
  td { padding: 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; }
  .right { text-align: right; }
  .mono { font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace; }
  .muted { color: #6b7280; }
  .small { font-size: 8pt; }
  tfoot td { font-weight: bold; background: #f3f4f6 !important; border-top: 2px solid #1e40af; }
  @media print { body { padding: 0; } @page { margin: 14mm; size: landscape; } }
</style></head><body>
  <h1>Relatório de Contas Bancárias</h1>
  <div class="sub">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
  <div class="meta">
    <div><b>Filtros aplicados:</b> ${filtros.length ? filtros.join(' &middot; ') : 'Nenhum'}</div>
    <div><b>Total de registros:</b> ${filtered.length}</div>
  </div>
  <table>
    <thead><tr>
      <th>Banco</th><th>Conta Corrente</th><th>Forma de Repasse</th>
      <th>Identificação</th><th>Recebedor</th><th class="right">Valor Repassado</th>
    </tr></thead>
    <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#666;">Nenhuma conta bancária encontrada.</td></tr>'}</tbody>
    ${filtered.length ? `<tfoot><tr><td colspan="5" class="right">Total Repassado:</td><td class="right mono">${fmt(totalRepassado)}</td></tr></tfoot>` : ''}
  </table>
  <script>window.onload = () => { window.print(); };<\/script>
</body></html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            Contas Bancárias
          </h1>
          <p className="text-sm text-muted-foreground">
            Relatório de contas bancárias vinculadas a convênios, planos de trabalho, emendas e transferências especiais
          </p>
        </div>
        <Button onClick={exportCSV} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por banco, conta, número, recebedor, CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={forma} onValueChange={setForma}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as formas</SelectItem>
              <SelectItem value="especial">Transferência Especial</SelectItem>
              <SelectItem value="convenio">Convênio</SelectItem>
              <SelectItem value="fundo">Fundo a Fundo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} conta{filtered.length === 1 ? '' : 's'} encontrada{filtered.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banco</TableHead>
                <TableHead>Conta Corrente</TableHead>
                <TableHead>Forma de Repasse</TableHead>
                <TableHead>Identificação</TableHead>
                <TableHead>Recebedor</TableHead>
                <TableHead className="text-right">Valor Repassado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma conta bancária encontrada.</TableCell></TableRow>
              )}
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.banco || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{r.conta_corrente || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{getForma(r)}</Badge></TableCell>
                  <TableCell className="text-sm">
                    {r.numero_convenio && <div><span className="text-muted-foreground">Convênio:</span> {r.numero_convenio}</div>}
                    {r.numero_plano_acao && <div><span className="text-muted-foreground">Plano de Ação:</span> {r.numero_plano_acao}</div>}
                    {r.numero && <div><span className="text-muted-foreground">Emenda:</span> {r.numero}</div>}
                    {r.numero_proposta && <div><span className="text-muted-foreground">Proposta:</span> {r.numero_proposta}</div>}
                    {!r.numero_convenio && !r.numero_plano_acao && !r.numero && !r.numero_proposta && '-'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.nome_recebedor}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.cnpj_recebedor}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(r.valor_repassado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
