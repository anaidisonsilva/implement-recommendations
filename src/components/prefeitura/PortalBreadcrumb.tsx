import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PortalBreadcrumbProps {
  slug: string;
  items: BreadcrumbItem[];
}

const PortalBreadcrumb = ({ slug, items }: PortalBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <nav aria-label="Navegação de páginas" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li className="flex items-center">
          <Link
            to={`/p/${slug}`}
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Portal</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {item.href ? (
              <Link
                to={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default PortalBreadcrumb;
