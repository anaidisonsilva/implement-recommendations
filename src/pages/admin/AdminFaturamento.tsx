import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrefeituras, useUpdatePrefeitura } from '@/hooks/usePrefeituras';
import { useFaturas, useGenerateInvoice, useCreateAsaasCustomer, useManualConfirm, useCheckInvoiceStatus } from '@/hooks/useFaturas';
import { toast } from 'sonner';
import { Receipt, Plus, Check, RefreshCw, ExternalLink, Building2, TestTube, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminFaturamento = () => {
  const { data: prefeituras, isLoading: loadingPref } = usePrefeituras();
  const { data: faturas, isLoading: loadingFaturas } = useFaturas();
  const generateInvoice = useGenerateInvoice();
  const createCustomer = useCreateAsaasCustomer();
  const manualConfirm = useManualConfirm();
  const checkStatus = useCheckInvoiceStatus();
  const updatePrefeitura = useUpdatePrefeitura();

  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [selectedPrefeitura, setSelectedPrefeitura] = useState('');
  const [invoiceValue, setInvoiceValue] = useState('');
  const [invoiceMonth, setInvoiceMonth] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [showSetPlan, setShowSetPlan] = useState(false);
  const [planPrefeitura, setPlanPrefeitura] = useState('');
  const [planValue, setPlanValue] = useState('');

  const handleGenerateInvoice = async () => {
    if (!selectedPrefeitura || !invoiceValue || !invoiceMonth || !invoiceDueDate) {
      toast.error('Preencha todos os campos');
      return;
    }

    const pref = prefeituras?.find(p => p.id === selectedPrefeitura);
    if (!pref) return;

    // Check if customer exists, create if not
    if (!(pref as any).asaas_customer_id) {
      try {
        await createCustomer.mutateAsync({
          prefeitura_id: pref.id,
          nome: pref.nome,
          cnpj: pref.cnpj || '00000000000000',
        });
      } catch {
        return;
      }
    }

    generateInvoice.mutate({
      prefeitura_id: selectedPrefeitura,
      valor: parseFloat(invoiceValue),
      mes_referencia: invoiceMonth,
      data_vencimento: invoiceDueDate,
    }, {
      onSuccess: () => {
        setShowNewInvoice(false);
        setSelectedPrefeitura('');
        setInvoiceValue('');
        setInvoiceMonth('');
        setInvoiceDueDate('');
      }
    });
  };

  const handleSetPlan = async () => {
    if (!planPrefeitura || !planValue) {
      toast.error('Preencha todos os campos');
      return;
    }
    updatePrefeitura.mutate({
      id: planPrefeitura,
      valor_plano: parseFloat(planValue),
    } as any);
    setShowSetPlan(false);
  };

  const handleToggleTeste = async (prefId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('prefeituras')
      .update({ is_teste: !currentValue } as any)
      .eq('id', prefId);
    if (error) {
      toast.error('Erro ao alterar modo teste');
    } else {
      toast.success(!currentValue ? 'Prefeitura em modo teste' : 'Modo teste desativado');
      window.location.reload();
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'OVERDUE': return 'Vencido';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
          <p className="text-muted-foreground mt-1">Gerencie faturas e planos das prefeituras</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSetPlan(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Definir Plano
          </Button>
          <Button onClick={() => { setShowNewInvoice(true); setInvoiceMonth(currentMonth); setInvoiceDueDate(''); }}>
            <Plus className="h-4 w-4 mr-2" />
            Gerar Fatura
          </Button>
        </div>
      </div>

      {/* Prefeituras overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Prefeituras - Status de Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefeitura</TableHead>
                <TableHead>Valor Plano</TableHead>
                <TableHead>Cliente Asaas</TableHead>
                <TableHead>Modo Teste</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prefeituras?.map((pref: any) => (
                <TableRow key={pref.id}>
                  <TableCell className="font-medium">{pref.nome}</TableCell>
                  <TableCell>
                    {pref.valor_plano ? `R$ ${Number(pref.valor_plano).toFixed(2)}` : 'Não definido'}
                  </TableCell>
                  <TableCell>
                    {pref.asaas_customer_id ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">Cadastrado</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pref.is_teste || false}
                        onCheckedChange={() => handleToggleTeste(pref.id, pref.is_teste || false)}
                      />
                      {pref.is_teste && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <TestTube className="h-3 w-3 mr-1" />
                          Teste
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Faturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFaturas ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : faturas?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma fatura gerada ainda</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prefeitura</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas?.map((fatura) => (
                  <TableRow key={fatura.id}>
                    <TableCell className="font-medium">
                      {(fatura as any).prefeituras?.nome || '-'}
                    </TableCell>
                    <TableCell>{fatura.mes_referencia}</TableCell>
                    <TableCell>R$ {Number(fatura.valor).toFixed(2)}</TableCell>
                    <TableCell>{new Date(fatura.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(fatura.status)}>
                        {statusLabel(fatura.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {fatura.status !== 'CONFIRMED' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => checkStatus.mutate(fatura.id)}
                              title="Verificar status"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => manualConfirm.mutate(fatura.id)}
                              title="Confirmar pagamento manualmente"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {fatura.url_boleto && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(fatura.url_boleto!, '_blank')}
                            title="Ver boleto"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Nova Fatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Prefeitura</Label>
              <Select value={selectedPrefeitura} onValueChange={(v) => {
                setSelectedPrefeitura(v);
                const p = prefeituras?.find((p: any) => p.id === v);
                if (p && (p as any).valor_plano) setInvoiceValue(String((p as any).valor_plano));
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {prefeituras?.filter((p: any) => !p.is_teste).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mês de Referência</Label>
              <Input type="month" value={invoiceMonth} onChange={(e) => setInvoiceMonth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={invoiceValue} onChange={(e) => setInvoiceValue(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewInvoice(false)}>Cancelar</Button>
            <Button onClick={handleGenerateInvoice} disabled={generateInvoice.isPending}>
              {generateInvoice.isPending ? 'Gerando...' : 'Gerar Fatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Plan Dialog */}
      <Dialog open={showSetPlan} onOpenChange={setShowSetPlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Valor do Plano</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Prefeitura</Label>
              <Select value={planPrefeitura} onValueChange={setPlanPrefeitura}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {prefeituras?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor Mensal (R$)</Label>
              <Input type="number" step="0.01" value={planValue} onChange={(e) => setPlanValue(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetPlan(false)}>Cancelar</Button>
            <Button onClick={handleSetPlan}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFaturamento;
