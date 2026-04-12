import { useInView } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

const AnimatedCard = ({ children, className, delay = 0, hover = true }: AnimatedCardProps) => {
  const { ref, isInView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className={cn(
        'transform transition-all duration-500 ease-out',
        hover && 'hover:scale-[1.02] hover:shadow-lg',
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
