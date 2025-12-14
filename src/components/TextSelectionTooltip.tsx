import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextSelectionTooltipProps {
  containerRef: React.RefObject<HTMLElement>;
  onHighlight: (text: string) => void;
  onAddNote: (text: string) => void;
}

export default function TextSelectionTooltip({
  containerRef,
  onHighlight,
  onAddNote,
}: TextSelectionTooltipProps) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length === 0) {
      setIsVisible(false);
      setSelectedText('');
      return;
    }

    // Check if selection is within the container
    const container = containerRef.current;
    if (!container) return;

    const range = selection?.getRangeAt(0);
    if (!range) return;

    // Check if the selection is within the container
    const selectionNode = range.commonAncestorContainer;
    if (!container.contains(selectionNode)) {
      return;
    }

    const rect = range.getBoundingClientRect();
    
    setSelectedText(text);
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsVisible(true);
  }, [containerRef]);

  // Use selectionchange event for more reliable detection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleSelectionChange = () => {
      // Debounce to avoid too many updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateTooltipPosition();
      }, 100);
    };

    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(updateTooltipPosition, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const tooltip = tooltipRef.current;
      if (tooltip && !tooltip.contains(e.target as Node)) {
        setIsVisible(false);
        setSelectedText('');
      }
    };

    const handleScroll = () => {
      setIsVisible(false);
      setSelectedText('');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        if (e.ctrlKey && e.key === 'h') {
          e.preventDefault();
          onHighlight(text);
          window.getSelection()?.removeAllRanges();
          setIsVisible(false);
        } else if (e.ctrlKey && e.key === 'n') {
          e.preventDefault();
          onAddNote(text);
          window.getSelection()?.removeAllRanges();
          setIsVisible(false);
        }
      }
    };

    // Listen on document for more reliable selection detection
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [updateTooltipPosition, onHighlight, onAddNote]);

  const handleHighlight = () => {
    if (selectedText) {
      onHighlight(selectedText);
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleAddNote = () => {
    if (selectedText) {
      onAddNote(selectedText);
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && position && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] flex items-center gap-1 p-1.5 rounded-xl bg-popover border border-border shadow-lg"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHighlight}
            className="h-8 px-3 gap-2 text-sm hover:bg-primary/20 hover:text-primary rounded-lg"
          >
            <Highlighter className="w-4 h-4" />
            Highlight
          </Button>
          <div className="w-px h-5 bg-border/50" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNote}
            className="h-8 px-3 gap-2 text-sm hover:bg-accent/20 hover:text-accent rounded-lg"
          >
            <StickyNote className="w-4 h-4" />
            Add Note
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
