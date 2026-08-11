export const isReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

export const getPerformanceTier = (): 'high' | 'low' => {
  if (typeof navigator !== 'undefined') {
    // Basic heuristic: check hardware concurrency
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return 'low';
    }
  }
  return 'high';
};

export const getParticleBudget = () => {
  const tier = getPerformanceTier();
  if (isReducedMotion()) return 0;
  return tier === 'high' ? 3000 : 500;
};
