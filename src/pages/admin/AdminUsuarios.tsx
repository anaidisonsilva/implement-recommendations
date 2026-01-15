import { useState } from 'react';
import { Plus, Trash2, Users, Loader2, Shield, Building2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useAllUserRoles, useCreateUserRole, useDeleteUserRole, AppRole } from '@/hooks/useUserRoles';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  prefeitura_admin: 'Admin da Prefeitura',
  prefeitura_user: 'Usuário da Prefeitura',
};

const AdminUsuarios = () => {
  const { data: userRoles, isLoading } = useAllUserRoles();
  const { data: prefeituras } = usePrefeituras();
  const createUserRole = useCreateUserRole();
  const deleteUserRole = useDeleteUserRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '' as AppRole | '',
    prefeitura_id: '',
  });
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!formData.email) return;

    setSearchingUser(true);
    try {
      // Search for user by email in profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nome_completo')
        .ilike('nome_completo', `%${formData.email}%`)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setFoundUserId(data[0].user_id);
        toast.success(`Usuário encontrado: ${data[0].nome_completo}`);
      } else {
        setFoundUserId(null);
        toast.error('Usuário não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar usuário');
    } finally {
      setSearchingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundUserId || !formData.role) {
      toast.error('Selecione um usuário e uma função');
      return;
    }

    const payload: { user_id: string; role: AppRole; prefeitura_id?: string } = {
      user_id: foundUserId,
      role: formData.role,
    };

    if (formData.role !== 'super_admin' && formData.prefeitura_id) {
      payload.prefeitura_id = formData.prefeitura_id;
    }

    await createUserRole.mutateAsync(payload);
    setDialogOpen(false);
    setFormData({ email: '', role: '', prefeitura_id: '' });
    setFoundUserId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta permissão?')) {
      await deleteUserRole.mutateAsync(id);
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
          <h1 className="text-2xl font-bold text-foreground">Usuários e Permissões</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as permissões dos usuários no sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Atribuir Permissão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atribuir Permissão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Buscar Usuário (nome)</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    placeholder="Nome do usuário"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Button type="button" variant="secondary" onClick={handleSearchUser} disabled={searchingUser}>
                    {searchingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                  </Button>
                </div>
                {foundUserId && (
                  <p className="text-sm text-green-600">✓ Usuário encontrado</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as AppRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="prefeitura_admin">Admin da Prefeitura</SelectItem>
                    <SelectItem value="prefeitura_user">Usuário da Prefeitura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role && formData.role !== 'super_admin' && (
                <div className="space-y-2">
                  <Label htmlFor="prefeitura">Prefeitura *</Label>
                  <Select
                    value={formData.prefeitura_id}
                    onValueChange={(value) => setFormData({ ...formData, prefeitura_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prefeitura" />
                    </SelectTrigger>
                    <SelectContent>
                      {prefeituras?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!foundUserId || !formData.role || createUserRole.isPending}>
                  {createUserRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atribuir
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {userRoles && userRoles.length > 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário ID</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Prefeitura</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-sm">
                    {role.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={role.role === 'super_admin' ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      {role.role === 'super_admin' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <Building2 className="h-3 w-3" />
                      )}
                      {roleLabels[role.role as AppRole]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(role as any).prefeituras?.nome ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Nenhuma permissão cadastrada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Atribua permissões aos usuários para começar
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
