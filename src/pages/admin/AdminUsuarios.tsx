import { useState } from 'react';
import { Plus, Trash2, Users, Loader2, Shield, Building2, UserPlus, Pencil } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllUserRoles, useCreateUserRole, useDeleteUserRole, AppRole, useIsSuperAdmin, useUserPrefeitura } from '@/hooks/useUserRoles';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  prefeitura_admin: 'Admin da Prefeitura',
  prefeitura_user: 'Usuário da Prefeitura',
};

const AdminUsuarios = () => {
  const queryClient = useQueryClient();
  const { data: userRoles, isLoading } = useAllUserRoles();
  const { data: prefeituras } = usePrefeituras();
  const createUserRole = useCreateUserRole();
  const deleteUserRole = useDeleteUserRole();
  const { isSuperAdmin } = useIsSuperAdmin();
  const { prefeituraId: userPrefeituraId } = useUserPrefeitura();

  // States for assigning role to existing user
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    email: '',
    role: '' as AppRole | '',
    prefeitura_id: '',
  });
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);

  // States for creating new user
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    nome_completo: '',
    role: '' as AppRole | '',
    prefeitura_id: '',
  });

  // States for editing user
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState({
    user_id: '',
    email: '',
    password: '',
    nome_completo: '',
  });

  const handleSearchUser = async () => {
    if (!assignFormData.email) return;

    setSearchingUser(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nome_completo')
        .ilike('nome_completo', `%${assignFormData.email}%`)
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

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundUserId || !assignFormData.role) {
      toast.error('Selecione um usuário e uma função');
      return;
    }

    const payload: { user_id: string; role: AppRole; prefeitura_id?: string } = {
      user_id: foundUserId,
      role: assignFormData.role,
    };

    if (assignFormData.role !== 'super_admin' && assignFormData.prefeitura_id) {
      payload.prefeitura_id = assignFormData.prefeitura_id;
    }

    await createUserRole.mutateAsync(payload);
    setAssignDialogOpen(false);
    setAssignFormData({ email: '', role: '', prefeitura_id: '' });
    setFoundUserId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.email || !createFormData.password || !createFormData.nome_completo || !createFormData.role) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (createFormData.role !== 'super_admin' && !createFormData.prefeitura_id) {
      toast.error('Selecione uma prefeitura');
      return;
    }

    if (createFormData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCreatingUser(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: createFormData.email,
          password: createFormData.password,
          nome_completo: createFormData.nome_completo,
          role: createFormData.role,
          prefeitura_id: createFormData.role !== 'super_admin' ? createFormData.prefeitura_id : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('Usuário criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['all_user_roles'] });
      setCreateDialogOpen(false);
      setCreateFormData({
        email: '',
        password: '',
        nome_completo: '',
        role: '',
        prefeitura_id: '',
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta permissão?')) {
      await deleteUserRole.mutateAsync(id);
    }
  };

  const handleEditOpen = async (userId: string) => {
    // Fetch user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo')
      .eq('user_id', userId)
      .single();

    setEditFormData({
      user_id: userId,
      email: '',
      password: '',
      nome_completo: profile?.nome_completo || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.user_id) {
      toast.error('Usuário não encontrado');
      return;
    }

    if (editFormData.password && editFormData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setEditingUser(true);
    try {
      const response = await supabase.functions.invoke('update-user', {
        body: {
          user_id: editFormData.user_id,
          email: editFormData.email || undefined,
          password: editFormData.password || undefined,
          nome_completo: editFormData.nome_completo || undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['all_user_roles'] });
      setEditDialogOpen(false);
      setEditFormData({ user_id: '', email: '', password: '', nome_completo: '' });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    } finally {
      setEditingUser(false);
    }
  };

  // Filter roles based on user permissions
  const filteredRoles = userRoles?.filter(role => {
    if (isSuperAdmin) return true;
    // Prefeitura admin can only see users from their prefeitura
    return role.prefeitura_id === userPrefeituraId;
  });

  // Get available roles for creating users
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'prefeitura_admin', label: 'Admin da Prefeitura' },
        { value: 'prefeitura_user', label: 'Usuário da Prefeitura' },
      ];
    }
    // Prefeitura admin can only create prefeitura_user
    return [
      { value: 'prefeitura_user', label: 'Usuário da Prefeitura' },
    ];
  };

  // Get available prefeituras for creating users
  const getAvailablePrefeituras = () => {
    if (isSuperAdmin) return prefeituras || [];
    // Prefeitura admin can only create users for their prefeitura
    return prefeituras?.filter(p => p.id === userPrefeituraId) || [];
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
            Gerencie os usuários e suas permissões no sistema
          </p>
        </div>
        <div className="flex gap-2">
          {/* Create New User Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    placeholder="Nome do usuário"
                    value={createFormData.nome_completo}
                    onChange={(e) => setCreateFormData({ ...createFormData, nome_completo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_email">Email *</Label>
                  <Input
                    id="create_email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_role">Função *</Label>
                  <Select
                    value={createFormData.role}
                    onValueChange={(value) => setCreateFormData({ ...createFormData, role: value as AppRole })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles().map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {createFormData.role && createFormData.role !== 'super_admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="create_prefeitura">Prefeitura *</Label>
                    <Select
                      value={createFormData.prefeitura_id}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, prefeitura_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prefeitura" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePrefeituras().map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creatingUser}>
                    {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Usuário
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Assign Role Dialog - Only for Super Admin */}
          {isSuperAdmin && (
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Atribuir Permissão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Atribuir Permissão a Usuário Existente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search_email">Buscar Usuário (nome)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="search_email"
                        placeholder="Nome do usuário"
                        value={assignFormData.email}
                        onChange={(e) => setAssignFormData({ ...assignFormData, email: e.target.value })}
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
                    <Label htmlFor="assign_role">Função *</Label>
                    <Select
                      value={assignFormData.role}
                      onValueChange={(value) => setAssignFormData({ ...assignFormData, role: value as AppRole })}
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
                  {assignFormData.role && assignFormData.role !== 'super_admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="assign_prefeitura">Prefeitura *</Label>
                      <Select
                        value={assignFormData.prefeitura_id}
                        onValueChange={(value) => setAssignFormData({ ...assignFormData, prefeitura_id: value })}
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
                    <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!foundUserId || !assignFormData.role || createUserRole.isPending}>
                      {createUserRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Atribuir
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {filteredRoles && filteredRoles.length > 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Prefeitura</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{(role as any).profile_nome || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{role.user_id.slice(0, 8)}...</p>
                    </div>
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditOpen(role.user_id)}
                        title="Editar usuário"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(role.id)}
                        title="Remover permissão"
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
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Nenhum usuário cadastrado
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie o primeiro usuário para começar
          </p>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_nome">Nome Completo</Label>
              <Input
                id="edit_nome"
                placeholder="Nome do usuário"
                value={editFormData.nome_completo}
                onChange={(e) => setEditFormData({ ...editFormData, nome_completo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Novo Email (opcional)</Label>
              <Input
                id="edit_email"
                type="email"
                placeholder="Deixe em branco para manter"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_password">Nova Senha (opcional)</Label>
              <Input
                id="edit_password"
                type="password"
                placeholder="Deixe em branco para manter"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editingUser}>
                {editingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;