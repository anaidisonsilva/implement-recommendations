import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BlockBannerProps {
  reason: string;
}

const BlockBanner = ({ reason }: BlockBannerProps) => {
  return (
    <Alert variant="destructive" className="mb-4 border-red-300 bg-red-50">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">Acesso Restrito</AlertTitle>
      <AlertDescription className="text-sm mt-1">
        {reason}
      </AlertDescription>
    </Alert>
  );
};

export default BlockBanner;
