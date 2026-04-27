import { useState, useEffect, useRef, useCallback } from 'react';

// Hook for fade-in animation when element enters viewport
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback: if IntersectionObserver doesn't fire within 300ms, force visible
    const fallback = setTimeout(() => setIsInView(true), 300);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
          clearTimeout(fallback);
        }
      },
      { threshold: 0 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [threshold]);

  return { ref, isInView };
}

// Hook for animated counter (counts from 0 to target)
export function useAnimatedCounter(target: number, duration = 1500, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const frameRef = useRef<number>();

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!started || target === 0) {
      setCount(target === 0 ? 0 : count);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;
      
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, started]);

  return { count, start };
}

// Hook for staggered children animation
export function useStaggerAnimation(itemCount: number, delayPerItem = 100) {
  const { ref, isInView } = useInView(0.05);
  
  const getDelay = (index: number) => ({
    transitionDelay: `${index * delayPerItem}ms`,
  });

  return { ref, isInView, getDelay };
}
