import { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { usePrefeituraBySlug, Prefeitura } from '@/hooks/usePrefeituras';

interface PrefeituraContextType {
  prefeitura: Prefeitura | null;
  isLoading: boolean;
  error: Error | null;
  slug: string | undefined;
}

const PrefeituraContext = createContext<PrefeituraContextType | undefined>(undefined);

export const usePrefeituraContext = () => {
  const context = useContext(PrefeituraContext);
  if (!context) {
    throw new Error('usePrefeituraContext must be used within a PrefeituraProvider');
  }
  return context;
};

interface PrefeituraProviderProps {
  children: ReactNode;
}

export const PrefeituraProvider = ({ children }: PrefeituraProviderProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura, isLoading, error } = usePrefeituraBySlug(slug ?? '');

  return (
    <PrefeituraContext.Provider
      value={{
        prefeitura: prefeitura ?? null,
        isLoading,
        error: error as Error | null,
        slug,
      }}
    >
      {children}
    </PrefeituraContext.Provider>
  );
};
