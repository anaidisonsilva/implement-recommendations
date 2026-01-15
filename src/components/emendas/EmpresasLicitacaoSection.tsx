import { useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useEmpresasByEmenda,
  useCreateEmpresa,
  useUpdateEmpresa,
  useDeleteEmpresa,
  useCreatePagamento,
  useUpdatePagamento,
  useDeletePagamento,
  EmpresaWithPagamentos,
  Pagamento,
} from '@/hooks/useEmpresasLicitacao';

interface EmpresasLicitacaoSectionProps {
  emendaId: string;
  readOnly?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const EmpresasLicitacaoSection = ({ emendaId, readOnly = false }: EmpresasLicitacaoSectionProps) => {
  const { data: empresas, isLoading } = useEmpresasByEmenda(emendaId);
  const createEmpresa = useCreateEmpresa();
  const updateEmpresa = useUpdateEmpresa();
  const deleteEmpresa = useDeleteEmpresa();
  const createPagamento = useCreatePagamento();
  const updatePagamento = useUpdatePagamento();
  const deletePagamento = useDeletePagamento();

  // Estados para empresa
  const [empresaDialogOpen, setEmpresaDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaWithPagamentos | null>(null);
  const [deleteEmpresaDialogOpen, setDeleteEmpresaDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<string | null>(null);
  const [empresaForm, setEmpresaForm] = useState({
    nome_empresa: '',
    cnpj: '',
    numero_empenho: '',
  });

  // Estados para pagamento
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [editingPagamento, setEditingPagamento] = useState<Pagamento | null>(null);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const [deletePagamentoDialogOpen, setDeletePagamentoDialogOpen] = useState(false);
  const [pagamentoToDelete, setPagamentoToDelete] = useState<string | null>(null);
  const [pagamentoForm, setPagamentoForm] = useState({
    valor: '',
    data_pagamento: '',
    descricao: '',
  });

  // Estados para collapsible
  const [openEmpresas, setOpenEmpresas] = useState<Set<string>>(new Set());

  const toggleEmpresa = (id: string) => {
    const newOpen = new Set(openEmpresas);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenEmpresas(newOpen);
  };

  // Handlers empresa
  const handleOpenEmpresaDialog = (empresa?: EmpresaWithPagamentos) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setEmpresaForm({
        nome_empresa: empresa.nome_empresa,
        cnpj: empresa.cnpj,
        numero_empenho: empresa.numero_empenho,
      });
    } else {
      setEditingEmpresa(null);
      setEmpresaForm({
        nome_empresa: '',
        cnpj: '',
        numero_empenho: '',
      });
    }
    setEmpresaDialogOpen(true);
  };

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmpresa) {
      await updateEmpresa.mutateAsync({
        id: editingEmpresa.id,
        ...empresaForm,
      });
    } else {
      await createEmpresa.mutateAsync({
        emenda_id: emendaId,
        ...empresaForm,
      });
    }

    setEmpresaDialogOpen(false);
  };

  const handleConfirmDeleteEmpresa = async () => {
    if (empresaToDelete) {
      await deleteEmpresa.mutateAsync(empresaToDelete);
      setDeleteEmpresaDialogOpen(false);
      setEmpresaToDelete(null);
    }
  };

  // Handlers pagamento
  const handleOpenPagamentoDialog = (empresaId: string, pagamento?: Pagamento) => {
    setSelectedEmpresaId(empresaId);
    if (pagamento) {
      setEditingPagamento(pagamento);
      setPagamentoForm({
        valor: String(pagamento.valor),
        data_pagamento: pagamento.data_pagamento,
        descricao: pagamento.descricao || '',
      });
    } else {
      setEditingPagamento(null);
      setPagamentoForm({
        valor: '',
        data_pagamento: '',
        descricao: '',
      });
    }
    setPagamentoDialogOpen(true);
  };

  const handleSavePagamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPagamento) {
      await updatePagamento.mutateAsync({
        id: editingPagamento.id,
        valor: parseFloat(pagamentoForm.valor),
        data_pagamento: pagamentoForm.data_pagamento,
        descricao: pagamentoForm.descricao || null,
      });
    } else if (selectedEmpresaId) {
      await createPagamento.mutateAsync({
        empresa_id: selectedEmpresaId,
        valor: parseFloat(pagamentoForm.valor),
        data_pagamento: pagamentoForm.data_pagamento,
        descricao: pagamentoForm.descricao || undefined,
      });
    }

    setPagamentoDialogOpen(false);
  };

  const handleConfirmDeletePagamento = async () => {
    if (pagamentoToDelete) {
      await deletePagamento.mutateAsync(pagamentoToDelete);
      setDeletePagamentoDialogOpen(false);
      setPagamentoToDelete(null);
    }
  };

  // Calcular total pago por empresa
  const getTotalPago = (pagamentos: Pagamento[]) => {
    return pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <Building2 className="h-5 w-5 text-primary" />
          Empresas Licitadas
        </h3>
        {!readOnly && (
          <Dialog open={empresaDialogOpen} onOpenChange={setEmpresaDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenEmpresaDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEmpresa ? 'Editar Empresa' : 'Cadastrar Empresa Licitada'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveEmpresa} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                  <Input
                    id="nome_empresa"
                    placeholder="Razão Social"
                    value={empresaForm.nome_empresa}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, nome_empresa: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={empresaForm.cnpj}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_empenho">Número do Empenho *</Label>
                  <Input
                    id="numero_empenho"
                    placeholder="Ex: 2024NE000123"
                    value={empresaForm.numero_empenho}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, numero_empenho: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEmpresaDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEmpresa.isPending || updateEmpresa.isPending}
                  >
                    {(createEmpresa.isPending || updateEmpresa.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingEmpresa ? 'Salvar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {empresas && empresas.length > 0 ? (
        <div className="space-y-3">
          {empresas.map((empresa) => (
            <Collapsible
              key={empresa.id}
              open={openEmpresas.has(empresa.id)}
              onOpenChange={() => toggleEmpresa(empresa.id)}
            >
              <div className="rounded-lg border border-border bg-muted/30">
                <CollapsibleTrigger asChild>
                  <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {openEmpresas.has(empresa.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{empresa.nome_empresa}</p>
                        <p className="text-sm text-muted-foreground">
                          CNPJ: {empresa.cnpj} • Empenho: {empresa.numero_empenho}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(getTotalPago(empresa.pagamentos || []))}
                      </Badge>
                      <Badge variant="outline">
                        {empresa.pagamentos?.length || 0} pagamentos
                      </Badge>
                      {!readOnly && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEmpresaDialog(empresa)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEmpresaToDelete(empresa.id);
                              setDeleteEmpresaDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Histórico de Pagamentos
                      </h4>
                      {!readOnly && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPagamentoDialog(empresa.id)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Novo Pagamento
                        </Button>
                      )}
                    </div>
                    {empresa.pagamentos && empresa.pagamentos.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Descrição</TableHead>
                            {!readOnly && <TableHead className="w-[80px]">Ações</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {empresa.pagamentos
                            .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())
                            .map((pagamento) => (
                              <TableRow key={pagamento.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {formatDate(pagamento.data_pagamento)}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-accent">
                                  {formatCurrency(Number(pagamento.valor))}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {pagamento.descricao || '-'}
                                </TableCell>
                                {!readOnly && (
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenPagamentoDialog(empresa.id, pagamento)}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setPagamentoToDelete(pagamento.id);
                                          setDeletePagamentoDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Nenhum pagamento registrado
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
          <Building2 className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma empresa licitada cadastrada
          </p>
          {!readOnly && (
            <Button
              variant="link"
              size="sm"
              onClick={() => handleOpenEmpresaDialog()}
              className="mt-1"
            >
              Cadastrar primeira empresa
            </Button>
          )}
        </div>
      )}

      {/* Dialog Pagamento */}
      <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPagamento ? 'Editar Pagamento' : 'Registrar Pagamento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePagamento} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={pagamentoForm.valor}
                onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={pagamentoForm.data_pagamento}
                onChange={(e) => setPagamentoForm({ ...pagamentoForm, data_pagamento: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição do pagamento (opcional)"
                value={pagamentoForm.descricao}
                onChange={(e) => setPagamentoForm({ ...pagamentoForm, descricao: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setPagamentoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPagamento.isPending || updatePagamento.isPending}
              >
                {(createPagamento.isPending || updatePagamento.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingPagamento ? 'Salvar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão Empresa */}
      <Dialog open={deleteEmpresaDialogOpen} onOpenChange={setDeleteEmpresaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Empresa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta empresa? Todos os pagamentos associados também serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEmpresaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteEmpresa}
              disabled={deleteEmpresa.isPending}
            >
              {deleteEmpresa.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão Pagamento */}
      <Dialog open={deletePagamentoDialogOpen} onOpenChange={setDeletePagamentoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Pagamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este pagamento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePagamentoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeletePagamento}
              disabled={deletePagamento.isPending}
            >
              {deletePagamento.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmpresasLicitacaoSection;