import { useState, useRef, useCallback, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | null;
  distance: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  preventDefaultTouchmoveEvent = false,
}: SwipeConfig) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
  });
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    isHorizontalSwipe.current = null;
    setSwipeState({ isSwiping: false, direction: null, distance: 0 });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    // Determine if this is a horizontal or vertical swipe
    if (isHorizontalSwipe.current === null) {
      const diffX = Math.abs(currentX - touchStartX.current);
      const diffY = Math.abs(currentY - touchStartY.current);
      
      if (diffX > 10 || diffY > 10) {
        isHorizontalSwipe.current = diffX > diffY;
      }
    }
    
    // Only track horizontal swipes
    if (isHorizontalSwipe.current) {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
      
      touchEndX.current = currentX;
      const distance = currentX - touchStartX.current;
      const direction = distance > 0 ? 'right' : 'left';
      
      setSwipeState({
        isSwiping: true,
        direction,
        distance: Math.abs(distance),
      });
    }
  }, [preventDefaultTouchmoveEvent]);

  const handleTouchEnd = useCallback(() => {
    if (!isHorizontalSwipe.current) {
      setSwipeState({ isSwiping: false, direction: null, distance: 0 });
      return;
    }
    
    const distance = touchEndX.current - touchStartX.current;
    const absDistance = Math.abs(distance);
    
    if (absDistance >= threshold) {
      if (distance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (distance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setSwipeState({ isSwiping: false, direction: null, distance: 0 });
    isHorizontalSwipe.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight]);

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    swipeHandlers,
    swipeState,
  };
};
