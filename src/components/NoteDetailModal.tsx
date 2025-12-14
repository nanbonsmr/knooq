import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, Tag, Quote, Calendar, FileText, Save } from 'lucide-react';
import { Note, useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface NoteDetailModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteDetailModal({ note, isOpen, onClose }: NoteDetailModalProps) {
  const { updateNote, deleteNote } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const handleEdit = () => {
    if (note) {
      setEditContent(note.content);
      setEditTags(note.tags.join(', '));
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (note) {
      updateNote(note.id, {
        content: editContent,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (note) {
      deleteNote(note.id);
      onClose();
    }
  };

  const handleGoToArticle = () => {
    if (note) {
      navigate(`/article/${encodeURIComponent(note.articleTitle)}`);
      onClose();
    }
  };

  if (!note) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden glass-card rounded-2xl border border-border/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Note Details</h2>
                  <button
                    onClick={handleGoToArticle}
                    className="text-sm text-primary hover:underline"
                  >
                    {note.articleTitle}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                      className="rounded-full"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      className="rounded-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Highlighted text */}
              {note.highlightedText && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border-l-4 border-yellow-500 mb-6">
                  <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <p className="text-foreground/90 italic text-lg leading-relaxed">
                      "{note.highlightedText}"
                    </p>
                  </div>
                </div>
              )}

              {/* Note content */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Your Notes
                    </label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Add your thoughts..."
                      className="min-h-32 bg-secondary/30 border-border/30 resize-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Tags
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags (comma separated)"
                        className="pl-9 bg-secondary/30 border-border/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {note.content ? (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Your Notes
                      </h3>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-xl bg-secondary/20 border border-dashed border-border/50 text-center">
                      <p className="text-muted-foreground mb-2">No notes added yet</p>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        Add Notes
                      </Button>
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
