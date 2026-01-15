import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  usePrefeituras,
  useCreatePrefeitura,
  useUpdatePrefeitura,
  useDeletePrefeitura,
  Prefeitura,
} from '@/hooks/usePrefeituras';
import { Link } from 'react-router-dom';

const AdminPrefeituras = () => {
  const { data: prefeituras, isLoading } = usePrefeituras();
  const createPrefeitura = useCreatePrefeitura();
  const updatePrefeitura = useUpdatePrefeitura();
  const deletePrefeitura = useDeletePrefeitura();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrefeitura, setEditingPrefeitura] = useState<Prefeitura | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    cnpj: '',
    municipio: '',
    estado: 'MG',
    logo_url: '',
  });

  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenDialog = (prefeitura?: Prefeitura) => {
    if (prefeitura) {
      setEditingPrefeitura(prefeitura);
      setFormData({
        nome: prefeitura.nome,
        slug: prefeitura.slug,
        cnpj: prefeitura.cnpj ?? '',
        municipio: prefeitura.municipio,
        estado: prefeitura.estado,
        logo_url: prefeitura.logo_url ?? '',
      });
    } else {
      setEditingPrefeitura(null);
      setFormData({
        nome: '',
        slug: '',
        cnpj: '',
        municipio: '',
        estado: 'MG',
        logo_url: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nome: formData.nome,
      slug: formData.slug,
      cnpj: formData.cnpj || undefined,
      municipio: formData.municipio,
      estado: formData.estado,
      logo_url: formData.logo_url || undefined,
    };

    if (editingPrefeitura) {
      await updatePrefeitura.mutateAsync({ id: editingPrefeitura.id, ...payload });
    } else {
      await createPrefeitura.mutateAsync(payload);
    }

    setDialogOpen(false);
  };

  const handleToggleAtivo = async (prefeitura: Prefeitura) => {
    await updatePrefeitura.mutateAsync({
      id: prefeitura.id,
      ativo: !prefeitura.ativo,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta prefeitura?')) {
      await deletePrefeitura.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prefeituras</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as prefeituras cadastradas no sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Prefeitura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPrefeitura ? 'Editar Prefeitura' : 'Nova Prefeitura'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Prefeitura Municipal de..."
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      nome: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  placeholder="prefeitura-municipal"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL: /p/{formData.slug || 'slug'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipio">Município *</Label>
                <Input
                  id="municipio"
                  placeholder="Nome do município"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  placeholder="https://..."
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createPrefeitura.isPending || updatePrefeitura.isPending}
                >
                  {(createPrefeitura.isPending || updatePrefeitura.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingPrefeitura ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {prefeituras && prefeituras.length > 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefeitura</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prefeituras.map((prefeitura) => (
                <TableRow key={prefeitura.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {prefeitura.logo_url ? (
                        <img
                          src={prefeitura.logo_url}
                          alt={prefeitura.nome}
                          className="h-10 w-10 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium">{prefeitura.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{prefeitura.municipio}</TableCell>
                  <TableCell>
                    <Link
                      to={`/p/${prefeitura.slug}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      /p/{prefeitura.slug}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={prefeitura.ativo}
                        onCheckedChange={() => handleToggleAtivo(prefeitura)}
                      />
                      <Badge variant={prefeitura.ativo ? 'default' : 'secondary'}>
                        {prefeitura.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(prefeitura)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(prefeitura.id)}
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Nenhuma prefeitura cadastrada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre a primeira prefeitura para começar
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPrefeituras;
