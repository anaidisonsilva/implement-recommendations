import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmendaDB } from '@/hooks/useEmendas';
import { differenceInDays, parseISO, isBefore } from 'date-fns';
import { useInView } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

interface VigenciaCardsProps {
  emendas?: EmendaDB[];
}

const VigenciaCards = ({ emendas }: VigenciaCardsProps) => {
  const today = new Date();
  const { ref, isInView } = useInView(0.1);

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

  const cards = [
    { label: 'Vencidas', count: vencidas.length, icon: XCircle, color: 'destructive', borderClass: 'border-destructive/50 bg-destructive/5', sub: 'convênios vencidos' },
    { label: 'Até 10 dias', count: vencendo10dias.length, icon: AlertTriangle, color: 'destructive', borderClass: 'border-destructive/30 bg-destructive/5', sub: 'prestes a vencer' },
    { label: 'Até 30 dias', count: vencendo30dias.length, icon: AlertCircle, color: 'warning', borderClass: 'border-warning/30 bg-warning/5', sub: 'a vencer' },
    { label: 'Até 90 dias', count: vencendo90dias.length, icon: Clock, color: 'info', borderClass: 'border-info/30 bg-info/5', sub: 'a vencer' },
  ];

  return (
    <div className="space-y-4" ref={ref}>
      <h2 className="text-lg font-semibold text-foreground">Vigência dos Convênios</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const IconComp = card.icon;
          return (
            <Card
              key={card.label}
              className={cn(
                card.borderClass,
                'transform transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-md',
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className={cn('flex items-center gap-2 text-sm font-medium', `text-${card.color}`)}>
                  <IconComp className="h-4 w-4" />
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn('text-2xl font-bold', `text-${card.color}`)}>{card.count}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(vencidas.length > 0 || vencendo10dias.length > 0) && (
        <Card className={cn(
          'transform transition-all duration-500 ease-out',
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        )} style={{ transitionDelay: '400ms' }}>
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
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-all duration-200 hover:bg-muted/50 hover:scale-[1.01]"
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
