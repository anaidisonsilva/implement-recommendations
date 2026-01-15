import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import {
  useCronogramaItems,
  useCreateCronogramaItem,
  useUpdateCronogramaItem,
  useDeleteCronogramaItem,
  CronogramaItemDB,
} from '@/hooks/usePlanoTrabalho';
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';

const formSchema = z.object({
  etapa: z.string().min(3, 'Etapa deve ter no mínimo 3 caracteres'),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().min(1, 'Data de término é obrigatória'),
  percentual_conclusao: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;

interface CronogramaSectionProps {
  planoTrabalhoId: string;
}

const CronogramaSection = ({ planoTrabalhoId }: CronogramaSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CronogramaItemDB | null>(null);
  
  const { data: cronogramaItems, isLoading } = useCronogramaItems(planoTrabalhoId);
  const createItem = useCreateCronogramaItem();
  const updateItem = useUpdateCronogramaItem();
  const deleteItem = useDeleteCronogramaItem();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      etapa: '',
      data_inicio: '',
      data_fim: '',
      percentual_conclusao: 0,
    },
  });

  const openDialog = (item?: CronogramaItemDB) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        etapa: item.etapa,
        data_inicio: item.data_inicio,
        data_fim: item.data_fim,
        percentual_conclusao: item.percentual_conclusao,
      });
    } else {
      setEditingItem(null);
      form.reset({
        etapa: '',
        data_inicio: '',
        data_fim: '',
        percentual_conclusao: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (editingItem) {
      await updateItem.mutateAsync({
        id: editingItem.id,
        plano_trabalho_id: planoTrabalhoId,
        etapa: data.etapa,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        percentual_conclusao: data.percentual_conclusao,
      });
    } else {
      await createItem.mutateAsync({
        plano_trabalho_id: planoTrabalhoId,
        etapa: data.etapa,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        percentual_conclusao: data.percentual_conclusao,
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta etapa?')) {
      await deleteItem.mutateAsync({ id, planoTrabalhoId });
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
  };

  const isFormLoading = createItem.isPending || updateItem.isPending;

  // Calculate overall progress
  const overallProgress = cronogramaItems?.length
    ? cronogramaItems.reduce((acc, item) => acc + item.percentual_conclusao, 0) / cronogramaItems.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Cronograma de Execução</h4>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Etapa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Etapa' : 'Nova Etapa do Cronograma'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="etapa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Etapa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Aquisição de materiais" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_fim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Término</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="percentual_conclusao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual de Conclusão: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={100}
                          step={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isFormLoading}>
                    {isFormLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingItem ? 'Salvar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      {cronogramaItems && cronogramaItems.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral do Cronograma</span>
            <span className="font-semibold text-foreground">{overallProgress.toFixed(0)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Cronograma Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : cronogramaItems && cronogramaItems.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cronogramaItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.etapa}</TableCell>
                  <TableCell>{formatDate(item.data_inicio)}</TableCell>
                  <TableCell>{formatDate(item.data_fim)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentual_conclusao} className="h-2 w-20" />
                      <span className="text-sm text-muted-foreground">
                        {item.percentual_conclusao}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteItem.isPending}
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
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">
            Nenhuma etapa cadastrada no cronograma.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Adicionar Etapa" para começar.
          </p>
        </div>
      )}
    </div>
  );
};

export default CronogramaSection;
