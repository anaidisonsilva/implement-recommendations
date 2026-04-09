import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useDocumentosByEmenda,
  useAddDocumentoLink,
  useDeleteDocumentoEmenda,
} from '@/hooks/usePlanoTrabalho';
import {
  FileText,
  Trash2,
  ExternalLink,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';

const tipoDocumentos = [
  { value: 'proposta', label: 'Proposta' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'relatorio', label: 'Relatório' },
  { value: 'comprovante', label: 'Comprovante' },
  { value: 'termo_referencia', label: 'Termo de Referência' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'ata', label: 'Ata' },
  { value: 'plano_trabalho', label: 'Plano de Trabalho' },
  { value: 'convenio', label: 'Convênio' },
  { value: 'outro', label: 'Outro' },
];

interface EmendaDocumentosSectionProps {
  emendaId: string;
}

const EmendaDocumentosSection = ({ emendaId }: EmendaDocumentosSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNome, setLinkNome] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  const { data: documentos, isLoading } = useDocumentosByEmenda(emendaId);
  const addLink = useAddDocumentoLink();
  const deleteDoc = useDeleteDocumentoEmenda();

  const handleAddLink = async () => {
    if (!linkUrl || !linkNome || !selectedTipo) return;

    await addLink.mutateAsync({
      emendaId,
      nome: linkNome,
      tipo: selectedTipo,
      url: linkUrl,
    });

    setLinkUrl('');
    setLinkNome('');
    setSelectedTipo('');
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este documento?')) {
      await deleteDoc.mutateAsync({ id, emendaId });
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getTipoLabel = (tipo: string) => {
    return tipoDocumentos.find((t) => t.value === tipo)?.label || tipo;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Documentos Anexados</h4>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <LinkIcon className="mr-2 h-4 w-4" />
              Adicionar Link PDF
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Link de Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Documento</Label>
                <Input
                  value={linkNome}
                  onChange={(e) => setLinkNome(e.target.value)}
                  placeholder="Ex: Contrato nº 001/2026"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoDocumentos.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>URL do Documento (PDF)</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com/documento.pdf"
                  type="url"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddLink}
                  disabled={!linkUrl || !linkNome || !selectedTipo || addLink.isPending}
                >
                  {addLink.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : documentos && documentos.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Inclusão</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span className="font-medium">{doc.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTipoLabel(doc.tipo)}</TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteDoc.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">
            Nenhum documento anexado.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Adicionar Link PDF" para vincular documentos externos.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmendaDocumentosSection;
