import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasLoaded(true);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible: isVisible || hasLoaded };
}

// Hook for paginated/infinite loading
interface UsePaginatedLoadOptions<T> {
  items: T[];
  pageSize?: number;
  initialLoad?: number;
}

export function usePaginatedLoad<T>({
  items,
  pageSize = 10,
  initialLoad = 10,
}: UsePaginatedLoadOptions<T>) {
  const [displayedCount, setDisplayedCount] = useState(initialLoad);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const displayedItems = items.slice(0, displayedCount);
  const hasMore = displayedCount < items.length;

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => Math.min(prev + pageSize, items.length));
  }, [items.length, pageSize]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  // Reset when items change
  useEffect(() => {
    setDisplayedCount(initialLoad);
  }, [items.length, initialLoad]);

  return {
    displayedItems,
    hasMore,
    loadMore,
    loadMoreRef,
    totalCount: items.length,
    displayedCount,
  };
}
