import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreatePlanoTrabalho, useUpdatePlanoTrabalho, PlanoTrabalhoDB } from '@/hooks/usePlanoTrabalho';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  objeto: z.string().min(10, 'Objeto deve ter no mínimo 10 caracteres'),
  finalidade: z.string().min(10, 'Finalidade deve ter no mínimo 10 caracteres'),
  estimativa_recursos: z.coerce.number().positive('Valor deve ser positivo'),
});

type FormData = z.infer<typeof formSchema>;

interface PlanoTrabalhoFormProps {
  emendaId: string;
  plano?: PlanoTrabalhoDB | null;
  onSuccess?: () => void;
}

const PlanoTrabalhoForm = ({ emendaId, plano, onSuccess }: PlanoTrabalhoFormProps) => {
  const [isEditing, setIsEditing] = useState(!plano);
  const createPlano = useCreatePlanoTrabalho();
  const updatePlano = useUpdatePlanoTrabalho();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objeto: plano?.objeto || '',
      finalidade: plano?.finalidade || '',
      estimativa_recursos: plano?.estimativa_recursos || 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (plano) {
      await updatePlano.mutateAsync({ id: plano.id, ...data });
      setIsEditing(false);
    } else {
      await createPlano.mutateAsync({ 
        emenda_id: emendaId, 
        objeto: data.objeto,
        finalidade: data.finalidade,
        estimativa_recursos: data.estimativa_recursos,
      });
      setIsEditing(false);
    }
    onSuccess?.();
  };

  const isLoading = createPlano.isPending || updatePlano.isPending;

  if (plano && !isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Objeto</p>
            <p className="font-medium text-foreground">{plano.objeto}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimativa de Recursos</p>
            <p className="font-medium text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plano.estimativa_recursos))}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Finalidade</p>
          <p className="font-medium text-foreground">{plano.finalidade}</p>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Editar Plano de Trabalho
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="objeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objeto do Plano de Trabalho</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o objeto do plano de trabalho..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="finalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Finalidade</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a finalidade do plano..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimativa_recursos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimativa de Recursos (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {plano ? 'Salvar Alterações' : 'Criar Plano de Trabalho'}
          </Button>
          {plano && (
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default PlanoTrabalhoForm;
