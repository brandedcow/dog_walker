import { useState, useEffect } from 'react';

export const useHUDLayout = () => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLargeScreen = windowSize.width > 1000;
  const uiScale = isLargeScreen ? Math.min(1.5, windowSize.width / 1200) : 1.0;
  
  // Safe areas with fallbacks
  const topSafe = 'env(safe-area-inset-top, 0px)';
  const bottomSafe = 'env(safe-area-inset-bottom, 0px)';
  const leftSafe = 'env(safe-area-inset-left, 0px)';
  const rightSafe = 'env(safe-area-inset-right, 0px)';

  const baseOffset = isLargeScreen ? Math.min(60, 20 + (windowSize.width - 1000) * 0.1) : 20;

  return {
    windowSize,
    uiScale,
    topSafe,
    bottomSafe,
    leftSafe,
    rightSafe,
    baseOffset,
    isLargeScreen
  };
};
