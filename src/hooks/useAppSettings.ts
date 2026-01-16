import { useEffect } from 'react';
import { useSystemSettings } from './useSystemSettings';

export const useAppSettings = () => {
  const { data: settings, isLoading } = useSystemSettings();

  const appTitle = settings?.find(s => s.key === 'app_title')?.value || 'Portal de Emendas';
  const faviconUrl = settings?.find(s => s.key === 'favicon_url')?.value || '';

  // Update document title and favicon when settings change
  useEffect(() => {
    if (!isLoading && appTitle) {
      document.title = appTitle;
    }
  }, [appTitle, isLoading]);

  useEffect(() => {
    if (!isLoading && faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [faviconUrl, isLoading]);

  return { appTitle, faviconUrl, isLoading };
};