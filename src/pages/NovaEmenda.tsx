import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateEmenda, CreateEmendaInput } from '@/hooks/useEmendas';

const NovaEmenda = () => {
  const navigate = useNavigate();
  const createEmenda = useCreateEmenda();

  const [formData, setFormData] = useState({
    numero: '',
    numeroConvenio: '',
    numeroPlanoAcao: '',
    numeroProposta: '',
    tipoConcedente: '' as 'parlamentar' | 'comissao' | 'bancada' | 'outro' | '',
    nomeConcedente: '',
    nomeParlamentar: '',
    tipoRecebedor: '' as 'administracao_publica' | 'entidade_sem_fins_lucrativos' | 'consorcio_publico' | 'pessoa_juridica_privada' | 'outro' | '',
    nomeRecebedor: '',
    cnpjRecebedor: '',
    municipio: '',
    estado: 'MG',
    dataDisponibilizacao: '',
    gestorResponsavel: '',
    objeto: '',
    grupoNaturezaDespesa: '',
    valor: '',
    contrapartida: '',
    banco: '',
    contaCorrente: '',
    anuenciaPreviaSUS: false,
    hasAnuencia: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipoConcedente || !formData.tipoRecebedor || !formData.grupoNaturezaDespesa) {
      return;
    }

    const input: CreateEmendaInput = {
      numero: formData.numero,
      numero_convenio: formData.numeroConvenio || null,
      numero_plano_acao: formData.numeroPlanoAcao || null,
      numero_proposta: formData.numeroProposta || null,
      tipo_concedente: formData.tipoConcedente,
      nome_concedente: formData.nomeConcedente || null,
      nome_parlamentar: formData.nomeParlamentar || null,
      tipo_recebedor: formData.tipoRecebedor,
      nome_recebedor: formData.nomeRecebedor,
      cnpj_recebedor: formData.cnpjRecebedor,
      municipio: formData.municipio,
      estado: formData.estado,
      data_disponibilizacao: formData.dataDisponibilizacao,
      gestor_responsavel: formData.gestorResponsavel,
      objeto: formData.objeto,
      grupo_natureza_despesa: formData.grupoNaturezaDespesa,
      valor: parseFloat(formData.valor),
      contrapartida: formData.contrapartida ? parseFloat(formData.contrapartida) : null,
      banco: formData.banco || null,
      conta_corrente: formData.contaCorrente || null,
      anuencia_previa_sus: formData.hasAnuencia ? formData.anuenciaPreviaSUS : null,
    };

    await createEmenda.mutateAsync(input);
    navigate('/emendas');
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link to="/emendas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Cadastrar Nova Emenda</h1>
          <p className="mt-1 text-muted-foreground">
            Preencha os dados conforme Art. 2º, §1º da Recomendação MPC-MG nº 01/2025
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numero">Número da Emenda *</Label>
              <Input
                id="numero"
                placeholder="Ex: 2026.0001"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataDisponibilizacao">Data de Disponibilização *</Label>
              <Input
                id="dataDisponibilizacao"
                type="date"
                value={formData.dataDisponibilizacao}
                onChange={(e) => handleChange('dataDisponibilizacao', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroConvenio">Número do Convênio</Label>
              <Input
                id="numeroConvenio"
                placeholder="Ex: CONV-2026/001"
                value={formData.numeroConvenio}
                onChange={(e) => handleChange('numeroConvenio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroPlanoAcao">Número do Plano de Ação</Label>
              <Input
                id="numeroPlanoAcao"
                placeholder="Ex: PA-2026/001"
                value={formData.numeroPlanoAcao}
                onChange={(e) => handleChange('numeroPlanoAcao', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="numeroProposta">Número da Proposta</Label>
              <Input
                id="numeroProposta"
                placeholder="Ex: PROP-2026/001"
                value={formData.numeroProposta}
                onChange={(e) => handleChange('numeroProposta', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Concedente e Parlamentar */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Origem do Recurso</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoConcedente">Tipo de Emenda *</Label>
              <Select
                value={formData.tipoConcedente}
                onValueChange={(value) => handleChange('tipoConcedente', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
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
              <Label htmlFor="nomeParlamentar">Nome do Parlamentar</Label>
              <Input
                id="nomeParlamentar"
                placeholder="Nome do parlamentar autor da emenda (opcional)"
                value={formData.nomeParlamentar}
                onChange={(e) => handleChange('nomeParlamentar', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nomeConcedente">Órgão Concedente</Label>
              <Input
                id="nomeConcedente"
                placeholder="Nome do órgão/ministério concedente do recurso (opcional)"
                value={formData.nomeConcedente}
                onChange={(e) => handleChange('nomeConcedente', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Recebedor */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recebedor</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoRecebedor">Tipo *</Label>
              <Select
                value={formData.tipoRecebedor}
                onValueChange={(value) => handleChange('tipoRecebedor', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
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
              <Label htmlFor="cnpjRecebedor">CNPJ *</Label>
              <Input
                id="cnpjRecebedor"
                placeholder="00.000.000/0000-00"
                value={formData.cnpjRecebedor}
                onChange={(e) => handleChange('cnpjRecebedor', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nomeRecebedor">Nome/Razão Social *</Label>
              <Input
                id="nomeRecebedor"
                placeholder="Nome completo do recebedor"
                value={formData.nomeRecebedor}
                onChange={(e) => handleChange('nomeRecebedor', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Localização e Gestão</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="municipio">Município *</Label>
              <Input
                id="municipio"
                placeholder="Nome do município"
                value={formData.municipio}
                onChange={(e) => handleChange('municipio', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value="MG" disabled />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gestorResponsavel">Gestor Responsável *</Label>
              <Input
                id="gestorResponsavel"
                placeholder="Nome completo do gestor responsável"
                value={formData.gestorResponsavel}
                onChange={(e) => handleChange('gestorResponsavel', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Objeto */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Objeto</h2>
          <div className="space-y-2">
            <Label htmlFor="objeto">Descrição do Objeto *</Label>
            <Textarea
              id="objeto"
              placeholder="Especifique a obra, serviço, aquisição, programa ou projeto"
              value={formData.objeto}
              onChange={(e) => handleChange('objeto', e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>

        {/* Dados Financeiros */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Dados Financeiros</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grupoNaturezaDespesa">Grupo Natureza de Despesa *</Label>
              <Select
                value={formData.grupoNaturezaDespesa}
                onValueChange={(value) => handleChange('grupoNaturezaDespesa', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o GND" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 - Pessoal e Encargos Sociais">1 - Pessoal e Encargos Sociais</SelectItem>
                  <SelectItem value="2 - Juros e Encargos da Dívida">2 - Juros e Encargos da Dívida</SelectItem>
                  <SelectItem value="3 - Outras Despesas Correntes">3 - Outras Despesas Correntes</SelectItem>
                  <SelectItem value="4 - Investimentos">4 - Investimentos</SelectItem>
                  <SelectItem value="5 - Inversões Financeiras">5 - Inversões Financeiras</SelectItem>
                  <SelectItem value="6 - Amortização da Dívida">6 - Amortização da Dívida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrapartida">Contrapartida (R$)</Label>
              <Input
                id="contrapartida"
                type="number"
                step="0.01"
                placeholder="0,00 (opcional)"
                value={formData.contrapartida}
                onChange={(e) => handleChange('contrapartida', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                placeholder="Nome da instituição bancária (opcional)"
                value={formData.banco}
                onChange={(e) => handleChange('banco', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contaCorrente">Conta Corrente</Label>
              <Input
                id="contaCorrente"
                placeholder="Número da conta (opcional)"
                value={formData.contaCorrente}
                onChange={(e) => handleChange('contaCorrente', e.target.value)}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            * Banco e conta corrente podem ser preenchidos após a aprovação do convênio
          </p>
        </div>

        {/* SUS */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Área da Saúde (SUS)</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Esta emenda é destinada à área da saúde?</Label>
                <p className="text-sm text-muted-foreground">
                  Se sim, informe sobre a anuência prévia do gestor do SUS
                </p>
              </div>
              <Switch
                checked={formData.hasAnuencia}
                onCheckedChange={(checked) => handleChange('hasAnuencia', checked)}
              />
            </div>
            {formData.hasAnuencia && (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <Label>Possui anuência prévia do gestor do SUS?</Label>
                <Switch
                  checked={formData.anuenciaPreviaSUS}
                  onCheckedChange={(checked) => handleChange('anuenciaPreviaSUS', checked)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/emendas">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" disabled={createEmenda.isPending}>
            {createEmenda.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Emenda
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovaEmenda;
