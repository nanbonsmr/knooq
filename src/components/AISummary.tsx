import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AISummaryProps {
  title: string;
  content: string;
}

export default function AISummary({ title, content }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-summarize', {
        body: { title, content }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold">AI Summary</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {!summary && !isLoading && !error && (
                <Button
                  onClick={generateSummary}
                  variant="outline"
                  className="w-full gap-2 border-dashed"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate TL;DR
                </Button>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating summary...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-4">
                  <p className="text-destructive text-sm mb-2">{error}</p>
                  <Button onClick={generateSummary} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-3 h-3" />
                    Try Again
                  </Button>
                </div>
              )}

              {summary && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-foreground/90 leading-relaxed">{summary}</p>
                  <Button
                    onClick={generateSummary}
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs text-muted-foreground"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
