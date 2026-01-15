import { Loader2, FileText, Calendar, Download, ExternalLink } from 'lucide-react';
import { usePlanoTrabalho, useCronogramaItems, useDocumentos } from '@/hooks/usePlanoTrabalho';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface PlanoTrabalhoPublicSectionProps {
  emendaId: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const PlanoTrabalhoPublicSection = ({ emendaId }: PlanoTrabalhoPublicSectionProps) => {
  const { data: plano, isLoading: loadingPlano } = usePlanoTrabalho(emendaId);
  const { data: cronograma, isLoading: loadingCronograma } = useCronogramaItems(plano?.id || '');
  const { data: documentos, isLoading: loadingDocumentos } = useDocumentos(plano?.id || '');

  if (loadingPlano) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!plano) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhum plano de trabalho cadastrado para esta emenda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detalhes do Plano */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Plano de Trabalho
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Objeto</p>
            <p className="mt-1 text-foreground">{plano.objeto}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Finalidade</p>
            <p className="mt-1 text-foreground">{plano.finalidade}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estimativa de Recursos</p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {formatCurrency(Number(plano.estimativa_recursos))}
            </p>
          </div>
        </div>
      </div>

      {/* Cronograma */}
      <div>
        <h4 className="flex items-center gap-2 font-semibold text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          Cronograma de Execução
        </h4>
        
        {loadingCronograma ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : cronograma && cronograma.length > 0 ? (
          <div className="mt-4 space-y-3">
            {cronograma.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.etapa}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(item.data_inicio)} a {formatDate(item.data_fim)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {item.percentual_conclusao}%
                  </span>
                </div>
                <div className="mt-3">
                  <Progress value={item.percentual_conclusao} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma etapa cadastrada no cronograma
          </p>
        )}
      </div>

      {/* Documentos */}
      <div>
        <h4 className="flex items-center gap-2 font-semibold text-foreground">
          <Download className="h-5 w-5 text-primary" />
          Documentos Anexados
        </h4>
        
        {loadingDocumentos ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : documentos && documentos.length > 0 ? (
          <div className="mt-4 space-y-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{doc.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.tipo} • {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum documento anexado
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanoTrabalhoPublicSection;
