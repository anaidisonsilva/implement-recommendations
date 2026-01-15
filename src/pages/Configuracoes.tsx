import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Loader2, Link as LinkIcon, Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import { useIsSuperAdmin, useUserPrefeitura } from '@/hooks/useUserRoles';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { data: prefeituras, isLoading } = usePrefeituras();
  const { isSuperAdmin } = useIsSuperAdmin();
  const { prefeituraId } = useUserPrefeitura();
  const { data: systemSettings, isLoading: isLoadingSettings } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const [systemName, setSystemName] = useState('');
  const [systemSubtitle, setSystemSubtitle] = useState('');

  // Initialize form values when settings load
  useEffect(() => {
    if (systemSettings) {
      const nameSetting = systemSettings.find(s => s.key === 'system_name');
      const subtitleSetting = systemSettings.find(s => s.key === 'system_subtitle');
      if (nameSetting) setSystemName(nameSetting.value);
      if (subtitleSetting) setSystemSubtitle(subtitleSetting.value);
    }
  }, [systemSettings]);

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

  const handleSaveSystemSettings = async () => {
    const currentName = systemSettings?.find(s => s.key === 'system_name')?.value;
    const currentSubtitle = systemSettings?.find(s => s.key === 'system_subtitle')?.value;

    if (systemName !== currentName) {
      await updateSetting.mutateAsync({ key: 'system_name', value: systemName });
    }
    if (systemSubtitle !== currentSubtitle) {
      await updateSetting.mutateAsync({ key: 'system_subtitle', value: systemSubtitle });
    }
  };

  if (isLoading || isLoadingSettings) {
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

      {/* Sistema - apenas para super admin */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Personalize o nome e subtítulo que aparecem no cabeçalho do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nome do Sistema</Label>
              <Input
                id="systemName"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="Ex: Portal de Emendas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemSubtitle">Subtítulo</Label>
              <Input
                id="systemSubtitle"
                value={systemSubtitle}
                onChange={(e) => setSystemSubtitle(e.target.value)}
                placeholder="Ex: Transparência e Rastreabilidade"
              />
            </div>
            <Button 
              onClick={handleSaveSystemSettings}
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      )}

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
