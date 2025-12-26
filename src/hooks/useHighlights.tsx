import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStore, Highlight } from '@/store/useStore';
import { toast } from 'sonner';

export interface DatabaseHighlight {
  id: string;
  user_id: string;
  article_title: string;
  text: string;
  color: string | null;
  created_at: string;
}

export function useHighlights(articleTitle?: string, articleId?: string) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Get local store functions for fallback
  const { 
    highlights: localHighlights, 
    addHighlight: addLocalHighlight, 
    removeHighlight: removeLocalHighlight 
  } = useStore();

  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Convert database highlight to local highlight format
  const dbToLocal = (dbHighlight: DatabaseHighlight): Highlight => ({
    id: dbHighlight.id,
    articleId: articleId || '',
    text: dbHighlight.text,
    color: dbHighlight.color || 'yellow',
    createdAt: new Date(dbHighlight.created_at),
  });

  // Fetch highlights from database
  const fetchHighlights = useCallback(async () => {
    if (!user) {
      // Use local highlights if not logged in
      const filtered = articleId 
        ? localHighlights.filter(h => h.articleId === articleId)
        : localHighlights;
      setHighlights(filtered);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (articleTitle) {
        query = query.eq('article_title', articleTitle);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching highlights:', error);
        // Fall back to local highlights
        const filtered = articleId 
          ? localHighlights.filter(h => h.articleId === articleId)
          : localHighlights;
        setHighlights(filtered);
      } else {
        setHighlights((data || []).map(dbToLocal));
      }
    } catch (err) {
      console.error('Failed to fetch highlights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, articleTitle, articleId, localHighlights]);

  // Fetch highlights on mount and when dependencies change
  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  // Add a new highlight
  const addHighlight = useCallback(async (highlightData: {
    text: string;
    color?: string;
  }) => {
    const title = articleTitle || 'Unknown';
    
    if (!user) {
      // Use local storage if not logged in
      addLocalHighlight({
        articleId: articleId || '',
        text: highlightData.text,
        color: highlightData.color || 'yellow',
      });
      await fetchHighlights();
      toast.success('Text highlighted');
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: user.id,
          article_title: title,
          text: highlightData.text,
          color: highlightData.color || 'yellow',
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding highlight:', error);
        toast.error('Failed to save highlight');
        // Fall back to local
        addLocalHighlight({
          articleId: articleId || '',
          text: highlightData.text,
          color: highlightData.color || 'yellow',
        });
      } else {
        toast.success('Text highlighted');
      }

      await fetchHighlights();
    } catch (err) {
      console.error('Failed to add highlight:', err);
      toast.error('Failed to save highlight');
    } finally {
      setIsSyncing(false);
    }
  }, [user, articleTitle, articleId, addLocalHighlight, fetchHighlights]);

  // Remove a highlight
  const removeHighlight = useCallback(async (id: string) => {
    if (!user) {
      removeLocalHighlight(id);
      await fetchHighlights();
      toast.success('Highlight removed');
      return;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting highlight:', error);
        toast.error('Failed to remove highlight');
      } else {
        toast.success('Highlight removed');
      }

      await fetchHighlights();
    } catch (err) {
      console.error('Failed to delete highlight:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [user, removeLocalHighlight, fetchHighlights]);

  return {
    highlights,
    isLoading,
    isSyncing,
    addHighlight,
    removeHighlight,
    refetch: fetchHighlights,
  };
}
