import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Search, Trash2, Tag, FileText, Download } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

export default function NotesPage() {
  const { notes, deleteNote } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.articleTitle.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  // Group notes by article
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const key = note.articleTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  const exportNotes = () => {
    const markdown = notes
      .map((note) => `## ${note.articleTitle}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}\n\n---\n`)
      .join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knooq-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <StickyNote className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Notes</h1>
                <p className="text-muted-foreground">{notes.length} notes collected</p>
              </div>
            </div>

            {notes.length > 0 && (
              <Button onClick={exportNotes} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/30"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className="gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-20">
              <StickyNote className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No notes yet</h2>
              <p className="text-muted-foreground mb-6">
                Start taking notes while reading articles
              </p>
              <Button onClick={() => navigate('/')}>Start Exploring</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedNotes).map(([articleTitle, articleNotes]) => (
                <motion.section
                  key={articleTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{articleTitle}</h2>
                    <Badge variant="secondary" className="ml-auto">
                      {articleNotes.length} notes
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {articleNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl bg-secondary/30 border border-border/30 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-foreground/90 flex-1">{note.content}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
