import { useState, useRef } from 'react';
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
  useDocumentos,
  useUploadDocumento,
  useDeleteDocumento,
} from '@/hooks/usePlanoTrabalho';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Loader2,
  File,
  FileImage,
  FileSpreadsheet,
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
  { value: 'outro', label: 'Outro' },
];

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext || '')) return <FileText className="h-5 w-5 text-red-500" />;
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

interface DocumentosSectionProps {
  planoTrabalhoId: string;
}

const DocumentosSection = ({ planoTrabalhoId }: DocumentosSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTipo, setSelectedTipo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documentos, isLoading } = useDocumentos(planoTrabalhoId);
  const uploadDocumento = useUploadDocumento();
  const deleteDocumento = useDeleteDocumento();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedTipo) return;

    await uploadDocumento.mutateAsync({
      file: selectedFile,
      planoTrabalhoId,
      tipo: selectedTipo,
    });

    setSelectedFile(null);
    setSelectedTipo('');
    setIsDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (confirm('Tem certeza que deseja remover este documento?')) {
      await deleteDocumento.mutateAsync({ id, planoTrabalhoId, url });
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
          <h4 className="font-semibold text-foreground">Documentos</h4>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Enviar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label>Arquivo</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedTipo || uploadDocumento.isPending}
                >
                  {uploadDocumento.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Table */}
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
                <TableHead>Data de Envio</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.nome)}
                      <span className="font-medium">{doc.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTipoLabel(doc.tipo)}</TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id, doc.url)}
                        disabled={deleteDocumento.isPending}
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
            Nenhum documento enviado ainda.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Enviar Documento" para adicionar arquivos.
          </p>
        </div>
      )}

      {/* Info notice */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <p>
          <strong>Formatos aceitos:</strong> PDF, PNG, JPG, JPEG, DOC, DOCX
        </p>
        <p>
          <strong>Tamanho máximo:</strong> 10 MB por arquivo
        </p>
      </div>
    </div>
  );
};

export default DocumentosSection;
