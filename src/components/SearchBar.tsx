import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { searchWikipedia, WikiSearchResult } from '@/lib/wikipedia';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [results, setResults] = useState<WikiSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const { setSearchQuery } = useStore();

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (localQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchWikipedia(localQuery, controller.signal);
      if (!controller.signal.aborted) {
        setResults(searchResults);
        setIsLoading(false);
      }
    }, 150); // Reduced debounce from 300ms to 150ms

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [localQuery]);

  const handleSelect = (title: string) => {
    setSearchQuery(title);
    setLocalQuery('');
    setResults([]);
    setIsFocused(false);
    navigate(`/article/${encodeURIComponent(title)}`);
  };

  const handleClear = () => {
    setLocalQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
          isFocused ? 'ring-2 ring-primary/50 glow-primary' : ''
        }`}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search the universe of knowledge..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
          />
          {isLoading && (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          {localQuery && !isLoading && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <motion.button
                  key={result.pageid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(result.title)}
                  className="w-full flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors text-left group"
                >
                  {result.thumbnail ? (
                    <img
                      src={result.thumbnail.source}
                      alt={result.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-primary flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {result.title[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {result.title}
                    </h4>
                    {result.extract && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {result.extract}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
