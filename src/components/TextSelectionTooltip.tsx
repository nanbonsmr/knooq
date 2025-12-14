import { useState, useEffect, useCallback } from 'react';
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

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0 && containerRef.current) {
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Check if selection is within container
        if (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom
        ) {
          setSelectedText(text);
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setIsVisible(true);
        }
      }
    }
  }, [containerRef]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const tooltip = document.getElementById('text-selection-tooltip');
    if (tooltip && !tooltip.contains(e.target as Node)) {
      setIsVisible(false);
      setSelectedText('');
    }
  }, []);

  const handleScroll = useCallback(() => {
    setIsVisible(false);
    setSelectedText('');
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [containerRef, handleMouseUp, handleMouseDown, handleScroll]);

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
          id="text-selection-tooltip"
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] flex items-center gap-1 p-1.5 rounded-xl glass-card border border-border/50 shadow-lg"
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
