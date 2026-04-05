import { Link } from 'react-router-dom';
import { useEmendas } from '@/hooks/useEmendas';
import { useFooterSettings } from '@/hooks/useSystemSettings';
import DadosAbertosSection from '@/components/dados-abertos/DadosAbertosSection';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, BarChart3, Star, ArrowLeft } from 'lucide-react';

const DynamicFooter = () => {
  const { footerText, footerCompliance } = useFooterSettings();
  return (
    <footer className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
      <p>{footerText}</p>
      <p className="mt-1">{footerCompliance}</p>
    </footer>
  );
};

const TransparenciaDadosAbertos = () => {
  const { data: emendas, isLoading } = useEmendas();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mappedEmendas = (emendas || []).map((e) => ({
    id: e.id,
    numero: e.numero,
    objeto: e.objeto,
    nome_concedente: e.nome_concedente,
    nome_parlamentar: e.nome_parlamentar,
    nome_recebedor: e.nome_recebedor,
    cnpj_recebedor: e.cnpj_recebedor,
    municipio: e.municipio,
    estado: e.estado,
    valor: Number(e.valor),
    valor_executado: Number(e.valor_executado),
    contrapartida: e.contrapartida ? Number(e.contrapartida) : null,
    status: e.status,
    data_disponibilizacao: e.data_disponibilizacao,
    programa: e.programa,
    especial: e.especial,
    tipo_concedente: e.tipo_concedente,
    tipo_recebedor: e.tipo_recebedor,
    grupo_natureza_despesa: e.grupo_natureza_despesa,
    data_inicio_vigencia: e.data_inicio_vigencia,
    data_fim_vigencia: e.data_fim_vigencia,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Dados Abertos
              </h1>
              <p className="mt-1 text-muted-foreground">
                Emendas Parlamentares — Dados em formatos abertos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/transparencia">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Transparência
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/transparencia/pix">
                  <Star className="mr-2 h-4 w-4" />
                  Dashboard PIX
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/transparencia/relatorios">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Área Restrita
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DadosAbertosSection emendas={mappedEmendas} />
        <DynamicFooter />
      </main>
    </div>
  );
};

export default TransparenciaDadosAbertos;
