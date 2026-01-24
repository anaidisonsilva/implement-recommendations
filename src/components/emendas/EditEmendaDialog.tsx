import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { EmendaDB, useUpdateEmenda } from '@/hooks/useEmendas';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditEmendaDialogProps {
  emenda: EmendaDB;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditEmendaDialog = ({ emenda, open, onOpenChange }: EditEmendaDialogProps) => {
  const updateEmenda = useUpdateEmenda();
  
  const [formData, setFormData] = useState({
    numero: '',
    tipo_concedente: '' as EmendaDB['tipo_concedente'],
    nome_concedente: '',
    nome_parlamentar: '',
    tipo_recebedor: '' as EmendaDB['tipo_recebedor'],
    nome_recebedor: '',
    cnpj_recebedor: '',
    municipio: '',
    estado: '',
    data_disponibilizacao: '',
    gestor_responsavel: '',
    objeto: '',
    grupo_natureza_despesa: '',
    valor: '',
    valor_executado: '',
    banco: '',
    conta_corrente: '',
    anuencia_previa_sus: false,
    contrapartida: '',
    numero_convenio: '',
    numero_plano_acao: '',
    numero_proposta: '',
    data_inicio_vigencia: '',
    data_fim_vigencia: '',
    especial: false,
    status: '' as EmendaDB['status'],
  });

  useEffect(() => {
    if (emenda && open) {
      setFormData({
        numero: emenda.numero,
        tipo_concedente: emenda.tipo_concedente,
        nome_concedente: emenda.nome_concedente || '',
        nome_parlamentar: emenda.nome_parlamentar || '',
        tipo_recebedor: emenda.tipo_recebedor,
        nome_recebedor: emenda.nome_recebedor,
        cnpj_recebedor: emenda.cnpj_recebedor,
        municipio: emenda.municipio,
        estado: emenda.estado,
        data_disponibilizacao: emenda.data_disponibilizacao,
        gestor_responsavel: emenda.gestor_responsavel,
        objeto: emenda.objeto,
        grupo_natureza_despesa: emenda.grupo_natureza_despesa,
        valor: String(emenda.valor),
        valor_executado: String(emenda.valor_executado),
        banco: emenda.banco || '',
        conta_corrente: emenda.conta_corrente || '',
        anuencia_previa_sus: emenda.anuencia_previa_sus || false,
        contrapartida: emenda.contrapartida ? String(emenda.contrapartida) : '',
        numero_convenio: emenda.numero_convenio || '',
        numero_plano_acao: emenda.numero_plano_acao || '',
        numero_proposta: emenda.numero_proposta || '',
        data_inicio_vigencia: emenda.data_inicio_vigencia || '',
        data_fim_vigencia: emenda.data_fim_vigencia || '',
        especial: emenda.especial || false,
        status: emenda.status,
      });
    }
  }, [emenda, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateEmenda.mutateAsync({
      id: emenda.id,
      numero: formData.numero,
      tipo_concedente: formData.tipo_concedente,
      nome_concedente: formData.nome_concedente || null,
      nome_parlamentar: formData.nome_parlamentar || null,
      tipo_recebedor: formData.tipo_recebedor,
      nome_recebedor: formData.nome_recebedor,
      cnpj_recebedor: formData.cnpj_recebedor,
      municipio: formData.municipio,
      estado: formData.estado,
      data_disponibilizacao: formData.data_disponibilizacao,
      gestor_responsavel: formData.gestor_responsavel,
      objeto: formData.objeto,
      grupo_natureza_despesa: formData.grupo_natureza_despesa,
      valor: parseFloat(formData.valor) || 0,
      valor_executado: parseFloat(formData.valor_executado) || 0,
      banco: formData.banco || null,
      conta_corrente: formData.conta_corrente || null,
      anuencia_previa_sus: formData.anuencia_previa_sus,
      contrapartida: formData.contrapartida ? parseFloat(formData.contrapartida) : null,
      numero_convenio: formData.numero_convenio || null,
      numero_plano_acao: formData.numero_plano_acao || null,
      numero_proposta: formData.numero_proposta || null,
      data_inicio_vigencia: formData.data_inicio_vigencia || null,
      data_fim_vigencia: formData.data_fim_vigencia || null,
      especial: formData.especial,
      status: formData.status,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Emenda</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identificação */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Identificação</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número da Emenda *</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as EmendaDB['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="em_execucao">Em Execução</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="objeto">Objeto *</Label>
                <Textarea
                  id="objeto"
                  value={formData.objeto}
                  onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Concedente e Parlamentar */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Concedente e Parlamentar</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo_concedente">Tipo de Concedente *</Label>
                  <Select
                    value={formData.tipo_concedente}
                    onValueChange={(value) => setFormData({ ...formData, tipo_concedente: value as EmendaDB['tipo_concedente'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parlamentar">Parlamentar</SelectItem>
                      <SelectItem value="comissao">Comissão</SelectItem>
                      <SelectItem value="bancada">Bancada</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_concedente">Nome do Concedente (Órgão)</Label>
                  <Input
                    id="nome_concedente"
                    value={formData.nome_concedente}
                    onChange={(e) => setFormData({ ...formData, nome_concedente: e.target.value })}
                    placeholder="Ex: Ministério da Saúde"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_parlamentar">Nome do Parlamentar</Label>
                <Input
                  id="nome_parlamentar"
                  value={formData.nome_parlamentar}
                  onChange={(e) => setFormData({ ...formData, nome_parlamentar: e.target.value })}
                  placeholder="Ex: Dep. João Silva"
                />
              </div>
            </div>

            {/* Recebedor */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Recebedor</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo_recebedor">Tipo de Recebedor *</Label>
                  <Select
                    value={formData.tipo_recebedor}
                    onValueChange={(value) => setFormData({ ...formData, tipo_recebedor: value as EmendaDB['tipo_recebedor'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administracao_publica">Administração Pública</SelectItem>
                      <SelectItem value="entidade_sem_fins_lucrativos">Entidade sem Fins Lucrativos</SelectItem>
                      <SelectItem value="consorcio_publico">Consórcio Público</SelectItem>
                      <SelectItem value="pessoa_juridica_privada">Pessoa Jurídica de Direito Privado</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_recebedor">Nome do Recebedor *</Label>
                  <Input
                    id="nome_recebedor"
                    value={formData.nome_recebedor}
                    onChange={(e) => setFormData({ ...formData, nome_recebedor: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj_recebedor">CNPJ do Recebedor *</Label>
                <Input
                  id="cnpj_recebedor"
                  value={formData.cnpj_recebedor}
                  onChange={(e) => setFormData({ ...formData, cnpj_recebedor: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Localização</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="municipio">Município *</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gestor_responsavel">Gestor Responsável *</Label>
                  <Input
                    id="gestor_responsavel"
                    value={formData.gestor_responsavel}
                    onChange={(e) => setFormData({ ...formData, gestor_responsavel: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_disponibilizacao">Data de Disponibilização *</Label>
                <Input
                  id="data_disponibilizacao"
                  type="date"
                  value={formData.data_disponibilizacao}
                  onChange={(e) => setFormData({ ...formData, data_disponibilizacao: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Dados Financeiros</h4>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor do Concedente (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_executado">Valor Executado (R$)</Label>
                  <Input
                    id="valor_executado"
                    type="number"
                    step="0.01"
                    value={formData.valor_executado}
                    onChange={(e) => setFormData({ ...formData, valor_executado: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contrapartida">Contrapartida (R$)</Label>
                  <Input
                    id="contrapartida"
                    type="number"
                    step="0.01"
                    value={formData.contrapartida}
                    onChange={(e) => setFormData({ ...formData, contrapartida: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-lg font-semibold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(
                      (parseFloat(formData.valor) || 0) + (parseFloat(formData.contrapartida) || 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Soma automática: Concedente + Contrapartida
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grupo_natureza_despesa">Grupo Natureza de Despesa *</Label>
                  <Input
                    id="grupo_natureza_despesa"
                    value={formData.grupo_natureza_despesa}
                    onChange={(e) => setFormData({ ...formData, grupo_natureza_despesa: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conta_corrente">Conta Corrente</Label>
                  <Input
                    id="conta_corrente"
                    value={formData.conta_corrente}
                    onChange={(e) => setFormData({ ...formData, conta_corrente: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Números de Referência */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Números de Referência</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numero_convenio">Nº do Convênio</Label>
                  <Input
                    id="numero_convenio"
                    value={formData.numero_convenio}
                    onChange={(e) => setFormData({ ...formData, numero_convenio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_plano_acao">Nº Plano de Ação</Label>
                  <Input
                    id="numero_plano_acao"
                    value={formData.numero_plano_acao}
                    onChange={(e) => setFormData({ ...formData, numero_plano_acao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_proposta">Nº da Proposta</Label>
                  <Input
                    id="numero_proposta"
                    value={formData.numero_proposta}
                    onChange={(e) => setFormData({ ...formData, numero_proposta: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Vigência do Convênio */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Vigência do Convênio</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio_vigencia">Data Início da Vigência</Label>
                  <Input
                    id="data_inicio_vigencia"
                    type="date"
                    value={formData.data_inicio_vigencia}
                    onChange={(e) => setFormData({ ...formData, data_inicio_vigencia: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim_vigencia">Data Fim da Vigência</Label>
                  <Input
                    id="data_fim_vigencia"
                    type="date"
                    value={formData.data_fim_vigencia}
                    onChange={(e) => setFormData({ ...formData, data_fim_vigencia: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Anuência SUS e Emenda Especial */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="especial"
                  checked={formData.especial}
                  onCheckedChange={(checked) => setFormData({ ...formData, especial: !!checked })}
                />
                <Label htmlFor="especial" className="font-medium">Emenda Especial ⭐</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anuencia_previa_sus"
                  checked={formData.anuencia_previa_sus}
                  onCheckedChange={(checked) => setFormData({ ...formData, anuencia_previa_sus: !!checked })}
                />
                <Label htmlFor="anuencia_previa_sus">Possui Anuência Prévia SUS</Label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateEmenda.isPending}>
                {updateEmenda.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmendaDialog;
