import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Search, StickyNote, Quote, GripVertical, Loader2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudyWorkspaceProps {
  articleTitle?: string;
  articleId?: string;
}

export default function StudyWorkspace({ articleTitle, articleId }: StudyWorkspaceProps) {
  const { notes, isLoading, isSyncing, addNote, updateNote, deleteNote } = useNotes(articleTitle, articleId);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [draggedText, setDraggedText] = useState<string | null>(null);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesSearch;
  });

  // Handle drop events for dragged text
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer?.getData('text/plain');
    if (text) {
      setDraggedText(text);
      setNewNoteContent(text);
      setIsAddingNote(true);
    }
  };

  const handleAddNote = async (highlightedText?: string) => {
    const content = highlightedText || newNoteContent;
    if (!content.trim()) return;

    await addNote({
      content,
      highlightedText: highlightedText || draggedText || undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewNoteContent('');
    setNewTags('');
    setIsAddingNote(false);
    setDraggedText(null);
  };

  return (
    <div 
      id="study-workspace" 
      className="flex flex-col h-full bg-background/50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/30 glass">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="font-semibold text-base sm:text-lg">Study Notes</h2>
          <Badge variant="secondary" className="text-xs">
            {filteredNotes.length}
          </Badge>
          {isSyncing && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Drag hint - hide on small screens */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-primary/5 border-b border-border/20 hidden sm:block">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <GripVertical className="w-4 h-4" />
          <span>Select text from article and drag here to create a note</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/30"
          />
        </div>
      </div>

      {/* Add Note Section */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <AnimatePresence mode="wait">
          {isAddingNote ? (
            <motion.div
              key="adding"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/30"
            >
              {draggedText && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-2">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80 italic line-clamp-3">{draggedText}</p>
                  </div>
                </div>
              )}
              <Textarea
                placeholder="Add your thoughts..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-24 bg-transparent border-border/30 resize-none"
                autoFocus
              />
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tags (comma separated)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="pl-9 bg-transparent border-border/30"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAddNote()} className="flex-1" disabled={isSyncing}>
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNote(false);
                    setDraggedText(null);
                    setNewNoteContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={() => setIsAddingNote(true)}
                variant="outline"
                className="w-full gap-2 border-dashed border-border/50 hover:border-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 px-3 sm:px-4">
        <div className="space-y-2 sm:space-y-3 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <StickyNote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No notes yet</p>
              <p className="text-sm text-muted-foreground/60">
                Highlight text and drag it here
              </p>
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <StudyNoteCard
                key={note.id}
                note={note}
                index={index}
                onUpdate={updateNote}
                onDelete={deleteNote}
                isSyncing={isSyncing}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface StudyNoteCardProps {
  note: Note;
  index: number;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isSyncing?: boolean;
}

function StudyNoteCard({ note, index, onUpdate, onDelete, isSyncing }: StudyNoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, editContent);
    setIsEditing(false);
  };

  // Parse content for quoted text
  const parseContent = (content: string) => {
    const quoteMatch = content.match(/^\[Quote: "(.+?)"\]\n\n(.*)$/s);
    if (quoteMatch) {
      return { quote: quoteMatch[1], text: quoteMatch[2] };
    }
    return { quote: note.highlightedText, text: content };
  };

  const { quote, text } = parseContent(note.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border/30 group hover:border-primary/20 transition-colors"
    >
      {quote && (
        <div className="p-2 rounded-lg bg-primary/5 border-l-2 border-primary mb-3">
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            "{quote}"
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <div className="flex-1 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-16 bg-transparent border-border/30 resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isSyncing}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p
            onClick={() => {
              setEditContent(note.content);
              setIsEditing(true);
            }}
            className="text-sm text-foreground/90 cursor-pointer hover:text-foreground transition-colors flex-1"
          >
            {text || note.content}
          </p>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(note.id)}
          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          disabled={isSyncing}
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </Button>
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground/60 mt-2">
        {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
}
