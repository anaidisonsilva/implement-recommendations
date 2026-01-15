import { Copy, ExternalLink, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import { useIsSuperAdmin, useUserPrefeitura } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { data: prefeituras, isLoading } = usePrefeituras();
  const { isSuperAdmin } = useIsSuperAdmin();
  const { prefeituraId } = useUserPrefeitura();

  // Get base URL for links
  const baseUrl = window.location.origin;

  // Filter prefeituras based on user role
  const filteredPrefeituras = prefeituras?.filter(p => {
    if (isSuperAdmin) return true;
    return p.id === prefeituraId;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado!');
  };

  const getPublicUrl = (slug: string) => `${baseUrl}/p/${slug}`;
  const getDashboardUrl = (slug: string) => `${baseUrl}/p/${slug}/dashboard`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie as configurações e acesse os links das prefeituras
        </p>
      </div>

      {/* Links das Prefeituras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Links das Prefeituras
          </CardTitle>
          <CardDescription>
            Copie os links para compartilhar com os usuários das prefeituras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPrefeituras && filteredPrefeituras.length > 0 ? (
            <div className="space-y-4">
              {filteredPrefeituras.map((prefeitura) => (
                <div key={prefeitura.id} className="rounded-lg border border-border p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground">{prefeitura.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {prefeitura.municipio} - {prefeitura.estado}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Portal Público */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Portal Público (Transparência)
                      </label>
                      <div className="mt-1 flex gap-2">
                        <Input 
                          readOnly 
                          value={getPublicUrl(prefeitura.slug)} 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(getPublicUrl(prefeitura.slug))}
                          title="Copiar link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => window.open(getPublicUrl(prefeitura.slug), '_blank')}
                          title="Abrir em nova aba"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Dashboard Administrativo */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Dashboard Administrativo (requer login)
                      </label>
                      <div className="mt-1 flex gap-2">
                        <Input 
                          readOnly 
                          value={getDashboardUrl(prefeitura.slug)} 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(getDashboardUrl(prefeitura.slug))}
                          title="Copiar link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => window.open(getDashboardUrl(prefeitura.slug), '_blank')}
                          title="Abrir em nova aba"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma prefeitura encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Transparência Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Portal de Transparência Geral</CardTitle>
          <CardDescription>
            Link para o portal público com todas as emendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={`${baseUrl}/transparencia`} 
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(`${baseUrl}/transparencia`)}
              title="Copiar link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.open(`${baseUrl}/transparencia`, '_blank')}
              title="Abrir em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
