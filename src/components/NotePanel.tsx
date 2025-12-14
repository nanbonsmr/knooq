import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Tag, Search, StickyNote } from 'lucide-react';
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
  const { notes, addNote, updateNote, deleteNote, isNotePanelOpen, setNotePanelOpen } = useStore();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const filteredNotes = notes.filter((note) => {
    const matchesArticle = articleId ? note.articleId === articleId : true;
    const matchesSearch = searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesArticle && matchesSearch;
  });

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    addNote({
      articleTitle: articleTitle || 'General',
      articleId: articleId || 'general',
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
          className="fixed right-0 top-0 bottom-0 w-full max-w-md glass border-l border-border/30 z-50"
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
                    <Button onClick={handleAddNote} className="flex-1">
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
                {filteredNotes.length === 0 ? (
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
  onUpdate: (id: string, content: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

function NoteCard({ note, index, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, { content: editContent });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border/30 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-primary font-medium">{note.articleTitle}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(note.id)}
          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-20 bg-transparent border-border/30 resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="text-sm text-foreground/90 cursor-pointer hover:text-foreground transition-colors"
        >
          {note.content}
        </p>
      )}

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
