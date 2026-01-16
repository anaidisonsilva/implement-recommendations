import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Loader2, Link as LinkIcon, Settings, Save, Palette, FileText, Globe, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [footerText, setFooterText] = useState('');
  const [footerCompliance, setFooterCompliance] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [headerColor, setHeaderColor] = useState('');
  const [appTitle, setAppTitle] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  // Initialize form values when settings load
  useEffect(() => {
    if (systemSettings) {
      const getSetting = (key: string) => systemSettings.find(s => s.key === key)?.value || '';
      setSystemName(getSetting('system_name'));
      setSystemSubtitle(getSetting('system_subtitle'));
      setFooterText(getSetting('footer_text'));
      setFooterCompliance(getSetting('footer_compliance'));
      setPrimaryColor(getSetting('primary_color'));
      setHeaderColor(getSetting('header_color'));
      setAppTitle(getSetting('app_title'));
      setFaviconUrl(getSetting('favicon_url'));
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
    const updates: { key: string; value: string }[] = [];
    const getSetting = (key: string) => systemSettings?.find(s => s.key === key)?.value || '';

    if (systemName !== getSetting('system_name')) updates.push({ key: 'system_name', value: systemName });
    if (systemSubtitle !== getSetting('system_subtitle')) updates.push({ key: 'system_subtitle', value: systemSubtitle });

    for (const update of updates) {
      await updateSetting.mutateAsync(update);
    }
    
    if (updates.length === 0) {
      toast.info('Nenhuma alteração detectada');
    }
  };

  const handleSaveFooterSettings = async () => {
    const updates: { key: string; value: string }[] = [];
    const getSetting = (key: string) => systemSettings?.find(s => s.key === key)?.value || '';

    if (footerText !== getSetting('footer_text')) updates.push({ key: 'footer_text', value: footerText });
    if (footerCompliance !== getSetting('footer_compliance')) updates.push({ key: 'footer_compliance', value: footerCompliance });

    for (const update of updates) {
      await updateSetting.mutateAsync(update);
    }
    
    if (updates.length === 0) {
      toast.info('Nenhuma alteração detectada');
    }
  };

  const handleSaveColorSettings = async () => {
    const updates: { key: string; value: string }[] = [];
    const getSetting = (key: string) => systemSettings?.find(s => s.key === key)?.value || '';

    if (primaryColor !== getSetting('primary_color')) updates.push({ key: 'primary_color', value: primaryColor });
    if (headerColor !== getSetting('header_color')) updates.push({ key: 'header_color', value: headerColor });

    for (const update of updates) {
      await updateSetting.mutateAsync(update);
    }
    
    if (updates.length === 0) {
      toast.info('Nenhuma alteração detectada');
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
        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="cores">Cores</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Gerais do Site
                </CardTitle>
                <CardDescription>
                  Personalize o título que aparece na aba do navegador e o ícone (favicon) do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appTitle">Título da Aba do Navegador</Label>
                  <Input
                    id="appTitle"
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    placeholder="Ex: Portal de Emendas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este texto aparece na aba do navegador (atualmente mostra "Lovable App")
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">URL do Favicon (ícone do site)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="faviconUrl"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="https://exemplo.com/favicon.ico"
                    />
                    {faviconUrl && (
                      <div className="h-10 w-10 shrink-0 rounded border border-border flex items-center justify-center bg-muted">
                        <img 
                          src={faviconUrl} 
                          alt="Favicon preview" 
                          className="h-6 w-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cole a URL de uma imagem .ico, .png ou .svg (recomendado: 32x32 pixels)
                  </p>
                </div>
                <Button 
                  onClick={async () => {
                    const updates: { key: string; value: string }[] = [];
                    const getSetting = (key: string) => systemSettings?.find(s => s.key === key)?.value || '';

                    if (appTitle !== getSetting('app_title')) updates.push({ key: 'app_title', value: appTitle });
                    if (faviconUrl !== getSetting('favicon_url')) updates.push({ key: 'favicon_url', value: faviconUrl });

                    for (const update of updates) {
                      await updateSetting.mutateAsync(update);
                    }
                    
                    if (updates.length === 0) {
                      toast.info('Nenhuma alteração detectada');
                    } else {
                      // Update document title immediately
                      if (appTitle) document.title = appTitle;
                      // Update favicon immediately
                      if (faviconUrl) {
                        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
                        link.type = 'image/x-icon';
                        link.rel = 'shortcut icon';
                        link.href = faviconUrl;
                        document.getElementsByTagName('head')[0].appendChild(link);
                      }
                    }
                  }}
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
          </TabsContent>

          <TabsContent value="sistema">
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
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Texto do Rodapé
                </CardTitle>
                <CardDescription>
                  Personalize as mensagens que aparecem no rodapé das páginas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footerText">Texto Principal do Rodapé</Label>
                  <Textarea
                    id="footerText"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Ex: Portal de Transparência de Emendas Parlamentares • ADPF 854/DF • MPC-MG"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerCompliance">Texto de Conformidade</Label>
                  <Textarea
                    id="footerCompliance"
                    value={footerCompliance}
                    onChange={(e) => setFooterCompliance(e.target.value)}
                    placeholder="Ex: Em conformidade com a Recomendação MPC-MG nº 01/2025..."
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={handleSaveFooterSettings}
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
          </TabsContent>

          <TabsContent value="cores">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Cores do Sistema
                </CardTitle>
                <CardDescription>
                  Personalize as cores principais do sistema (formato HSL: ex: 222 47% 25%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária (HSL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="222 47% 25%"
                      />
                      <div 
                        className="h-10 w-10 rounded border border-border shrink-0"
                        style={{ backgroundColor: primaryColor ? `hsl(${primaryColor})` : 'hsl(222 47% 25%)' }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headerColor">Cor do Cabeçalho (HSL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="headerColor"
                        value={headerColor}
                        onChange={(e) => setHeaderColor(e.target.value)}
                        placeholder="222 47% 20%"
                      />
                      <div 
                        className="h-10 w-10 rounded border border-border shrink-0"
                        style={{ backgroundColor: headerColor ? `hsl(${headerColor})` : 'hsl(222 47% 20%)' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  <p><strong>Dica:</strong> Use valores HSL separados por espaço. Exemplo:</p>
                  <ul className="mt-1 list-disc list-inside">
                    <li>Azul institucional: 222 47% 25%</li>
                    <li>Verde: 142 76% 36%</li>
                    <li>Vermelho: 0 84% 60%</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleSaveColorSettings}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Cores
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
