import { AlertTriangle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO, isBefore } from 'date-fns';

interface Emenda {
  id: string;
  numero: string;
  objeto: string;
  data_fim_vigencia: string | null;
}

interface PublicVigenciaCardsProps {
  emendas: Emenda[];
}

const PublicVigenciaCards = ({ emendas }: PublicVigenciaCardsProps) => {
  const today = new Date();

  // Filter emendas by vigência status
  const emendasWithVigencia = emendas?.filter(e => e.data_fim_vigencia) || [];
  
  const vencidas = emendasWithVigencia.filter(e => {
    const dataFim = parseISO(e.data_fim_vigencia!);
    return isBefore(dataFim, today);
  });

  const vencendo10dias = emendasWithVigencia.filter(e => {
    const dataFim = parseISO(e.data_fim_vigencia!);
    const dias = differenceInDays(dataFim, today);
    return dias >= 0 && dias <= 10;
  });

  const vencendo30dias = emendasWithVigencia.filter(e => {
    const dataFim = parseISO(e.data_fim_vigencia!);
    const dias = differenceInDays(dataFim, today);
    return dias > 10 && dias <= 30;
  });

  const vencendo90dias = emendasWithVigencia.filter(e => {
    const dataFim = parseISO(e.data_fim_vigencia!);
    const dias = differenceInDays(dataFim, today);
    return dias > 30 && dias <= 90;
  });

  if (emendasWithVigencia.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Vigência dos Convênios</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Vencidas */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
              <XCircle className="h-4 w-4" />
              Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{vencidas.length}</p>
            <p className="text-xs text-muted-foreground">convênios vencidos</p>
          </CardContent>
        </Card>

        {/* 10 dias */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Até 10 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{vencendo10dias.length}</p>
            <p className="text-xs text-muted-foreground">prestes a vencer</p>
          </CardContent>
        </Card>

        {/* 30 dias */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-warning">
              <AlertCircle className="h-4 w-4" />
              Até 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{vencendo30dias.length}</p>
            <p className="text-xs text-muted-foreground">a vencer</p>
          </CardContent>
        </Card>

        {/* 90 dias */}
        <Card className="border-info/30 bg-info/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-info">
              <Clock className="h-4 w-4" />
              Até 90 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-info">{vencendo90dias.length}</p>
            <p className="text-xs text-muted-foreground">a vencer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicVigenciaCards;