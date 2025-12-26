import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface CachedArticle {
  title: string;
  content: string;
  timestamp: number;
  images?: string[];
}

const CACHE_KEY = 'knooq-offline-articles';
const MAX_CACHED_ARTICLES = 50;

export const useOfflineArticles = () => {
  const [cachedArticles, setCachedArticles] = useState<CachedArticle[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load cached articles from localStorage
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      try {
        setCachedArticles(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cached articles:', e);
      }
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Cached articles are available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveArticleForOffline = useCallback((title: string, content: string, images?: string[]) => {
    setCachedArticles(prev => {
      // Check if article already exists
      const existingIndex = prev.findIndex(a => a.title === title);
      
      let updated: CachedArticle[];
      
      if (existingIndex >= 0) {
        // Update existing article
        updated = [...prev];
        updated[existingIndex] = { title, content, timestamp: Date.now(), images };
      } else {
        // Add new article, remove oldest if at max capacity
        const newArticle = { title, content, timestamp: Date.now(), images };
        if (prev.length >= MAX_CACHED_ARTICLES) {
          // Sort by timestamp and remove oldest
          const sorted = [...prev].sort((a, b) => b.timestamp - a.timestamp);
          updated = [newArticle, ...sorted.slice(0, MAX_CACHED_ARTICLES - 1)];
        } else {
          updated = [newArticle, ...prev];
        }
      }
      
      // Save to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save article to cache:', e);
        toast.error('Failed to save article for offline reading');
        return prev;
      }
      
      return updated;
    });
    
    toast.success(`"${title}" saved for offline reading`);
  }, []);

  const removeArticleFromCache = useCallback((title: string) => {
    setCachedArticles(prev => {
      const updated = prev.filter(a => a.title !== title);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    toast.success(`"${title}" removed from offline cache`);
  }, []);

  const getOfflineArticle = useCallback((title: string): CachedArticle | undefined => {
    return cachedArticles.find(a => a.title === title);
  }, [cachedArticles]);

  const isArticleCached = useCallback((title: string): boolean => {
    return cachedArticles.some(a => a.title === title);
  }, [cachedArticles]);

  const clearAllCachedArticles = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCachedArticles([]);
    toast.success('All offline articles cleared');
  }, []);

  const getCacheSize = useCallback(() => {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return 0;
    return new Blob([stored]).size;
  }, []);

  return {
    cachedArticles,
    isOnline,
    saveArticleForOffline,
    removeArticleFromCache,
    getOfflineArticle,
    isArticleCached,
    clearAllCachedArticles,
    getCacheSize,
  };
};
