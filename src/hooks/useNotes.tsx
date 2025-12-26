import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStore, Note } from '@/store/useStore';
import { toast } from 'sonner';

export interface DatabaseNote {
  id: string;
  user_id: string;
  article_title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(articleTitle?: string, articleId?: string) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Get local store functions for fallback
  const { 
    notes: localNotes, 
    addNote: addLocalNote, 
    updateNote: updateLocalNote, 
    deleteNote: deleteLocalNote 
  } = useStore();

  const [notes, setNotes] = useState<Note[]>([]);

  // Convert database note to local note format
  const dbToLocal = (dbNote: DatabaseNote): Note => ({
    id: dbNote.id,
    articleTitle: dbNote.article_title,
    articleId: articleId || '',
    content: dbNote.content,
    highlightedText: undefined,
    tags: [],
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
  });

  // Fetch notes from database
  const fetchNotes = useCallback(async () => {
    if (!user) {
      // Use local notes if not logged in
      const filtered = articleTitle 
        ? localNotes.filter(n => n.articleTitle === articleTitle)
        : localNotes;
      setNotes(filtered);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (articleTitle) {
        query = query.eq('article_title', articleTitle);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notes:', error);
        // Fall back to local notes
        const filtered = articleTitle 
          ? localNotes.filter(n => n.articleTitle === articleTitle)
          : localNotes;
        setNotes(filtered);
      } else {
        setNotes((data || []).map(dbToLocal));
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, articleTitle, localNotes, articleId]);

  // Fetch notes on mount and when dependencies change
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add a new note
  const addNote = useCallback(async (noteData: {
    content: string;
    highlightedText?: string;
    tags?: string[];
  }) => {
    const title = articleTitle || 'General';
    
    if (!user) {
      // Use local storage if not logged in
      addLocalNote({
        articleTitle: title,
        articleId: articleId || 'general',
        content: noteData.content,
        highlightedText: noteData.highlightedText,
        tags: noteData.tags || [],
      });
      await fetchNotes();
      return;
    }

    setIsSyncing(true);
    try {
      // Combine highlighted text and content for database
      const fullContent = noteData.highlightedText 
        ? `[Quote: "${noteData.highlightedText}"]\n\n${noteData.content}`
        : noteData.content;

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          article_title: title,
          content: fullContent,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
        toast.error('Failed to save note');
        // Fall back to local
        addLocalNote({
          articleTitle: title,
          articleId: articleId || 'general',
          content: noteData.content,
          highlightedText: noteData.highlightedText,
          tags: noteData.tags || [],
        });
      } else {
        toast.success('Note saved');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Failed to add note:', err);
      toast.error('Failed to save note');
    } finally {
      setIsSyncing(false);
    }
  }, [user, articleTitle, articleId, addLocalNote, fetchNotes]);

  // Update an existing note
  const updateNote = useCallback(async (id: string, content: string) => {
    if (!user) {
      updateLocalNote(id, { content });
      await fetchNotes();
      return;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating note:', error);
        toast.error('Failed to update note');
      } else {
        toast.success('Note updated');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [user, updateLocalNote, fetchNotes]);

  // Delete a note
  const deleteNote = useCallback(async (id: string) => {
    if (!user) {
      deleteLocalNote(id);
      await fetchNotes();
      return;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
      } else {
        toast.success('Note deleted');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [user, deleteLocalNote, fetchNotes]);

  return {
    notes,
    isLoading,
    isSyncing,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
