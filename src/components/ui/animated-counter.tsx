import { useEffect } from 'react';
import { useAnimatedCounter, useInView } from '@/hooks/useAnimations';

interface AnimatedCounterProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
  duration?: number;
}

const AnimatedCounter = ({ value, formatter, className, duration = 1500 }: AnimatedCounterProps) => {
  const { ref, isInView } = useInView(0.1);
  const { count, start } = useAnimatedCounter(value, duration);

  useEffect(() => {
    if (isInView) start();
  }, [isInView, start]);

  const display = formatter ? formatter(count) : Math.round(count).toString();

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};

export default AnimatedCounter;
