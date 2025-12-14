import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Highlighter, Trash2, Search, ChevronRight, Download } from 'lucide-react';
import { useStore, Highlight } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { exportHighlightsOnly, downloadMarkdown } from '@/lib/export';

interface HighlightsPanelProps {
  articleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToHighlight: (highlightId: string) => void;
}

export default function HighlightsPanel({ 
  articleId, 
  isOpen, 
  onClose,
  onNavigateToHighlight 
}: HighlightsPanelProps) {
  const { highlights, removeHighlight } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const articleHighlights = highlights.filter((h) => {
    const matchesArticle = articleId ? h.articleId === articleId : true;
    const matchesSearch = searchQuery
      ? h.text.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesArticle && matchesSearch;
  });

  const handleDelete = (id: string) => {
    removeHighlight(id);
    toast({ title: 'Highlight removed' });
  };

  const handleNavigate = (highlight: Highlight) => {
    onNavigateToHighlight(highlight.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:max-w-sm glass border-l border-border/30 z-50"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Highlighter className="w-5 h-5 text-yellow-500" />
                <h2 className="font-semibold text-lg">Highlights</h2>
                <Badge variant="secondary" className="text-xs">
                  {articleHighlights.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {articleHighlights.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const markdown = exportHighlightsOnly(articleHighlights);
                      downloadMarkdown(markdown, 'highlights.md');
                      toast({ title: 'Highlights exported' });
                    }}
                    className="rounded-full"
                    title="Export highlights"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
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

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search highlights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/30"
                />
              </div>
            </div>

            {/* Highlights List */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 pb-4">
                {articleHighlights.length === 0 ? (
                  <div className="text-center py-12">
                    <Highlighter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No highlights yet</p>
                    <p className="text-sm text-muted-foreground/60">
                      Select text and press Ctrl+H to highlight
                    </p>
                  </div>
                ) : (
                  articleHighlights.map((highlight, index) => (
                    <HighlightCard
                      key={highlight.id}
                      highlight={highlight}
                      index={index}
                      onDelete={handleDelete}
                      onNavigate={handleNavigate}
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

interface HighlightCardProps {
  highlight: Highlight;
  index: number;
  onDelete: (id: string) => void;
  onNavigate: (highlight: Highlight) => void;
}

function HighlightCard({ highlight, index, onDelete, onNavigate }: HighlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border/30 group hover:border-yellow-500/30 transition-colors"
    >
      {/* Highlighted text preview */}
      <div 
        className="p-3 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-500 mb-3 cursor-pointer hover:bg-yellow-500/20 transition-colors"
        onClick={() => onNavigate(highlight)}
      >
        <p className="text-sm text-foreground/90 line-clamp-3">
          "{highlight.text}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground/60">
          {new Date(highlight.createdAt).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(highlight)}
            className="h-7 px-2 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Go to
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(highlight.id)}
            className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
