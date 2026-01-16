import { useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const AppSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings, isLoading } = useSystemSettings();

  const appTitle = settings?.find(s => s.key === 'app_title')?.value || '';
  const faviconUrl = settings?.find(s => s.key === 'favicon_url')?.value || '';

  // Update document title when settings change
  useEffect(() => {
    if (!isLoading && appTitle) {
      document.title = appTitle;
    }
  }, [appTitle, isLoading]);

  // Update favicon when settings change
  useEffect(() => {
    if (!isLoading && faviconUrl) {
      // Find existing favicon or create a new one
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
      link.href = faviconUrl;
    }
  }, [faviconUrl, isLoading]);

  return <>{children}</>;
};

export default AppSettingsProvider;