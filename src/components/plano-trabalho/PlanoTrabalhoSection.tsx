import { usePlanoTrabalho } from '@/hooks/usePlanoTrabalho';
import PlanoTrabalhoForm from './PlanoTrabalhoForm';
import CronogramaSection from './CronogramaSection';
import DocumentosSection from './DocumentosSection';
import { Loader2, ClipboardList, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';

interface PlanoTrabalhoSectionProps {
  emendaId: string;
}

const PlanoTrabalhoSection = ({ emendaId }: PlanoTrabalhoSectionProps) => {
  const queryClient = useQueryClient();
  const { data: plano, isLoading } = usePlanoTrabalho(emendaId);

  const handlePlanoCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['plano-trabalho', emendaId] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Plano de Trabalho</h3>
      </div>

      {!plano ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-foreground">
                  Plano de Trabalho não cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Conforme Art. 2º, §1º, inciso VIII da Recomendação MPC-MG nº 01/2025, 
                  é obrigatório cadastrar o Plano de Trabalho com cronograma de execução, 
                  etapas e respectivos prazos.
                </p>
              </div>
            </div>
          </div>
          <PlanoTrabalhoForm emendaId={emendaId} onSuccess={handlePlanoCreated} />
        </div>
      ) : (
        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="mt-4">
            <PlanoTrabalhoForm 
              emendaId={emendaId} 
              plano={plano} 
              onSuccess={handlePlanoCreated} 
            />
          </TabsContent>

          <TabsContent value="cronograma" className="mt-4">
            <CronogramaSection planoTrabalhoId={plano.id} />
          </TabsContent>

          <TabsContent value="documentos" className="mt-4">
            <DocumentosSection planoTrabalhoId={plano.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PlanoTrabalhoSection;
