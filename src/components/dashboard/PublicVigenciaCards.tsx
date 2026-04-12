import { AlertTriangle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO, isBefore } from 'date-fns';
import { useInView } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

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

  if (emendasWithVigencia.length === 0) {
    return null;
  }

  const cards = [
    { label: 'Vencidas', count: vencidas.length, icon: XCircle, color: 'destructive', borderClass: 'border-destructive/50 bg-destructive/5' },
    { label: 'Até 10 dias', count: vencendo10dias.length, icon: AlertTriangle, color: 'destructive', borderClass: 'border-destructive/30 bg-destructive/5' },
    { label: 'Até 30 dias', count: vencendo30dias.length, icon: AlertCircle, color: 'warning', borderClass: 'border-warning/30 bg-warning/5' },
    { label: 'Até 90 dias', count: vencendo90dias.length, icon: Clock, color: 'info', borderClass: 'border-info/30 bg-info/5' },
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
                <p className="text-xs text-muted-foreground">
                  {card.label === 'Vencidas' ? 'convênios vencidos' : card.label === 'Até 10 dias' ? 'prestes a vencer' : 'a vencer'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PublicVigenciaCards;
