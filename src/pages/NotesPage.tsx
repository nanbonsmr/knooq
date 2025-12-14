import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Search, Trash2, Tag, FileText, Download, Eye, Highlighter, ChevronDown, Quote, FileDown } from 'lucide-react';
import Header from '@/components/Header';
import NoteDetailModal from '@/components/NoteDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { useStore, Note } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  exportToMarkdown, 
  exportNotesOnly, 
  exportHighlightsOnly, 
  downloadMarkdown,
  exportToPDF,
  exportNotesToPDF,
  exportHighlightsToPDF
} from '@/lib/export';
import { toast } from '@/hooks/use-toast';

export default function NotesPage() {
  const { notes, highlights, deleteNote } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.articleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.highlightedText?.toLowerCase().includes(searchQuery.toLowerCase()))
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

  // Markdown exports
  const handleExportAllMd = () => {
    const markdown = exportToMarkdown(notes, highlights);
    downloadMarkdown(markdown, 'knooq-export.md');
    toast({ title: 'Exported as Markdown', description: `${notes.length} notes and ${highlights.length} highlights` });
  };

  const handleExportNotesMd = () => {
    const markdown = exportNotesOnly(notes);
    downloadMarkdown(markdown, 'knooq-notes.md');
    toast({ title: 'Notes exported as Markdown' });
  };

  const handleExportHighlightsMd = () => {
    const markdown = exportHighlightsOnly(highlights);
    downloadMarkdown(markdown, 'knooq-highlights.md');
    toast({ title: 'Highlights exported as Markdown' });
  };

  // PDF exports
  const handleExportAllPdf = () => {
    exportToPDF(notes, highlights, 'knooq-export.pdf');
    toast({ title: 'Exported as PDF', description: `${notes.length} notes and ${highlights.length} highlights` });
  };

  const handleExportNotesPdf = () => {
    exportNotesToPDF(notes);
    toast({ title: 'Notes exported as PDF' });
  };

  const handleExportHighlightsPdf = () => {
    exportHighlightsToPDF(highlights);
    toast({ title: 'Highlights exported as PDF' });
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsDetailOpen(true);
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
                <h1 className="text-3xl font-bold">Notes & Highlights</h1>
                <p className="text-muted-foreground">
                  {notes.length} notes · {highlights.length} highlights
                </p>
              </div>
            </div>

            {(notes.length > 0 || highlights.length > 0) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <FileText className="w-4 h-4" />
                      Export as Markdown
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={handleExportAllMd} className="gap-2">
                        Export All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportNotesMd} className="gap-2" disabled={notes.length === 0}>
                        Notes Only ({notes.length})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportHighlightsMd} className="gap-2" disabled={highlights.length === 0}>
                        Highlights Only ({highlights.length})
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <FileDown className="w-4 h-4" />
                      Export as PDF
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={handleExportAllPdf} className="gap-2">
                        Export All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportNotesPdf} className="gap-2" disabled={notes.length === 0}>
                        Notes Only ({notes.length})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportHighlightsPdf} className="gap-2" disabled={highlights.length === 0}>
                        Highlights Only ({highlights.length})
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes and highlights..."
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

          {notes.length === 0 && highlights.length === 0 ? (
            <div className="text-center py-20">
              <StickyNote className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No notes or highlights yet</h2>
              <p className="text-muted-foreground mb-6">
                Start taking notes and highlighting text while reading articles
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
                        className="p-4 rounded-xl bg-secondary/30 border border-border/30 group hover:border-primary/20 transition-colors cursor-pointer"
                        onClick={() => handleViewNote(note)}
                      >
                        {/* Highlighted text preview */}
                        {note.highlightedText && (
                          <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-500">
                            <Quote className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/80 italic line-clamp-2">
                              "{note.highlightedText}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                          {note.content ? (
                            <p className="text-foreground/90 flex-1 line-clamp-2">{note.content}</p>
                          ) : (
                            <p className="text-muted-foreground italic flex-1">No notes added</p>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewNote(note);
                              }}
                              className="w-8 h-8"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="w-8 h-8"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* Note Detail Modal */}
      <NoteDetailModal
        note={selectedNote}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedNote(null);
        }}
      />
    </div>
  );
}
