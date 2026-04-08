import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFaturas } from '@/hooks/useFaturas';
import { useUserPrefeitura } from '@/hooks/useUserRoles';
import { Receipt, ExternalLink, FileText } from 'lucide-react';

const PrefeituraFaturas = () => {
  const { prefeituraId } = useUserPrefeitura();
  const { data: faturas, isLoading } = useFaturas(prefeituraId ?? undefined);

  const statusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'OVERDUE': return 'Vencido';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Faturas</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas faturas e boletos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : !faturas?.length ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma fatura disponível</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Boleto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.map((fatura) => (
                  <TableRow key={fatura.id}>
                    <TableCell className="font-medium">{fatura.mes_referencia}</TableCell>
                    <TableCell>R$ {Number(fatura.valor).toFixed(2)}</TableCell>
                    <TableCell>{new Date(fatura.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {fatura.data_pagamento ? new Date(fatura.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(fatura.status)}>
                        {statusLabel(fatura.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {fatura.url_boleto && (
                          <Button size="sm" variant="ghost" onClick={() => window.open(fatura.url_boleto!, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {fatura.url_boleto_pdf && (
                          <Button size="sm" variant="ghost" onClick={() => window.open(fatura.url_boleto_pdf!, '_blank')}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrefeituraFaturas;
