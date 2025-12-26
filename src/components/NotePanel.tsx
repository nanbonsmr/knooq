import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Tag, Search, StickyNote, Quote, Edit2, Loader2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useStore, Note } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotePanelProps {
  articleTitle?: string;
  articleId?: string;
}

export default function NotePanel({ articleTitle, articleId }: NotePanelProps) {
  const { notes, addNote, updateNote, deleteNote, isLoading, isSyncing } = useNotes(articleTitle, articleId);
  const { isNotePanelOpen, setNotePanelOpen } = useStore();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesSearch;
  });

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    await addNote({
      content: newNoteContent,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewNoteContent('');
    setNewTags('');
    setIsAddingNote(false);
  };

  return (
    <AnimatePresence>
      {isNotePanelOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md glass border-l border-border/30 z-50"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Notes</h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredNotes.length}
                </Badge>
                {isSyncing && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotePanelOpen(false)}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4">
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
            <div className="px-4 pb-4">
              {isAddingNote ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <Textarea
                    placeholder="Write your note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-24 bg-transparent border-border/30 resize-none"
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
                    <Button onClick={handleAddNote} className="flex-1" disabled={isSyncing}>
                      {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingNote(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button
                  onClick={() => setIsAddingNote(true)}
                  variant="outline"
                  className="w-full gap-2 border-dashed border-border/50 hover:border-primary hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              )}
            </div>

            {/* Notes List */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 pb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <StickyNote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No notes yet</p>
                    <p className="text-sm text-muted-foreground/60">
                      Start taking notes while reading
                    </p>
                  </div>
                ) : (
                  filteredNotes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      onUpdate={updateNote}
                      onDelete={deleteNote}
                      isSyncing={isSyncing}
                      articleTitle={articleTitle}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

interface NoteCardProps {
  note: Note;
  index: number;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isSyncing?: boolean;
  articleTitle?: string;
}

function NoteCard({ note, index, onUpdate, onDelete, isSyncing, articleTitle }: NoteCardProps) {
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
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border/30 group hover:border-primary/20 transition-colors"
    >
      {/* Header with article title and actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-primary font-medium">{note.articleTitle || articleTitle}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="w-6 h-6"
            disabled={isSyncing}
          >
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
            className="w-6 h-6"
            disabled={isSyncing}
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Highlighted text display */}
      {quote && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-500 mb-3">
          <div className="flex items-start gap-2">
            <Quote className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 italic line-clamp-3">
              "{quote}"
            </p>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Add your thoughts about this highlight..."
            className="min-h-20 bg-transparent border-border/30 resize-none text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSyncing}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setIsEditing(false);
              setEditContent(note.content);
            }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {text ? (
            <p
              onClick={() => {
                setEditContent(note.content);
                setIsEditing(true);
              }}
              className="text-sm text-foreground/90 cursor-pointer hover:text-foreground transition-colors"
            >
              {text}
            </p>
          ) : (
            <button
              onClick={() => {
                setEditContent(note.content);
                setIsEditing(true);
              }}
              className="text-sm text-muted-foreground italic hover:text-foreground transition-colors"
            >
              Click to add a note...
            </button>
          )}
        </>
      )}

      {note.tags.length > 0 && !isEditing && (
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
