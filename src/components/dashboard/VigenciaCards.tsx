import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmendas } from '@/hooks/useEmendas';
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';

const VigenciaCards = () => {
  const { data: emendas } = useEmendas();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysText = (dataFim: string) => {
    const dias = differenceInDays(parseISO(dataFim), today);
    if (dias < 0) return `Vencido há ${Math.abs(dias)} dias`;
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    return `Vence em ${dias} dias`;
  };

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

      {/* Lista de convênios críticos */}
      {(vencidas.length > 0 || vencendo10dias.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Atenção: Convênios que precisam de ação imediata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...vencidas, ...vencendo10dias].slice(0, 5).map((emenda) => (
                <Link
                  key={emenda.id}
                  to={`/emendas/${emenda.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      Emenda Nº {emenda.numero}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {emenda.objeto}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <Badge variant={vencidas.includes(emenda) ? "destructive" : "outline"} className={vencidas.includes(emenda) ? "" : "border-destructive text-destructive"}>
                      {getDaysText(emenda.data_fim_vigencia!)}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vigência: {formatDate(emenda.data_fim_vigencia!)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VigenciaCards;
