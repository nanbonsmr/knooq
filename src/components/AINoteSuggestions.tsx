import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useStore, Note } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

interface NoteSuggestion {
  content: string;
  tags: string[];
}

interface AINoteSuggestionsProps {
  highlightedText: string;
  articleTitle: string;
  articleId: string;
  articleContent?: string;
  onClose: () => void;
}

export default function AINoteSuggestions({
  highlightedText,
  articleTitle,
  articleId,
  articleContent,
  onClose,
}: AINoteSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<NoteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNote, notes } = useStore();

  const existingNotes = notes.filter(n => n.articleId === articleId);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-suggest-notes', {
        body: {
          highlightedText,
          articleTitle,
          articleContent,
          existingNotes: existingNotes.map(n => ({ content: n.content })),
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = (suggestion: NoteSuggestion) => {
    addNote({
      articleTitle,
      articleId,
      content: suggestion.content,
      highlightedText,
      tags: suggestion.tags,
    });
    toast({ title: 'Note added!' });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-4 rounded-xl bg-secondary/50 border border-border/30 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">AI Note Suggestions</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-6 h-6">
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Highlighted text preview */}
      <div className="p-2 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-500">
        <p className="text-xs text-foreground/80 italic line-clamp-2">
          "{highlightedText}"
        </p>
      </div>

      {suggestions.length === 0 && !isLoading && !error && (
        <Button
          onClick={fetchSuggestions}
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          <Sparkles className="w-3 h-3" />
          Generate Smart Notes
        </Button>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating suggestions...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-2">
          <p className="text-destructive text-xs mb-2">{error}</p>
          <Button onClick={fetchSuggestions} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg bg-background/50 border border-border/20 hover:border-primary/30 transition-colors group"
            >
              <p className="text-sm text-foreground/90 mb-2">{suggestion.content}</p>
              {suggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {suggestion.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                onClick={() => handleAddNote(suggestion)}
                variant="ghost"
                size="sm"
                className="w-full gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="w-3 h-3" />
                Add This Note
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
