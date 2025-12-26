import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, StickyNote, Sparkles, Copy, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface TextSelectionTooltipProps {
  containerRef: React.RefObject<HTMLElement>;
  onHighlight: (text: string) => void;
  onAddNote: (text: string) => void;
  onAISuggest?: (text: string) => void;
}

export default function TextSelectionTooltip({
  containerRef,
  onHighlight,
  onAddNote,
  onAISuggest,
}: TextSelectionTooltipProps) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { isPro } = useSubscription();

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
    if (!isPro) {
      toast.error('Upgrade to Pro to use highlights', {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/pricing',
        },
      });
      return;
    }
    if (selectedText) {
      onHighlight(selectedText);
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleAddNote = () => {
    if (!isPro) {
      toast.error('Upgrade to Pro to add notes', {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/pricing',
        },
      });
      return;
    }
    if (selectedText) {
      onAddNote(selectedText);
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleAISuggest = () => {
    if (selectedText && onAISuggest) {
      onAISuggest(selectedText);
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy');
      }
    }
  };

  // Calculate safe position to keep tooltip within viewport
  const getSafePosition = () => {
    if (!position) return { left: 0, top: 0 };
    
    const tooltipWidth = 280; // Approximate max width
    const padding = 12;
    const viewportWidth = window.innerWidth;
    
    let left = position.x;
    let top = position.y;
    
    // Keep tooltip within horizontal bounds
    if (left - tooltipWidth / 2 < padding) {
      left = tooltipWidth / 2 + padding;
    } else if (left + tooltipWidth / 2 > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth / 2 - padding;
    }
    
    // If too close to top, show below selection
    if (top < 60) {
      top = position.y + 50;
    }
    
    return { left, top };
  };

  const safePos = getSafePosition();

  return (
    <AnimatePresence>
      {isVisible && position && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-xl bg-popover border border-border shadow-lg max-w-[calc(100vw-24px)]"
          style={{
            left: `${safePos.left}px`,
            top: `${safePos.top}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-muted rounded-lg"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden xs:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          <div className="w-px h-5 bg-border/50 hidden xs:block" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHighlight}
            className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-primary/20 hover:text-primary rounded-lg relative"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">Highlight</span>
            {!isPro && <Crown className="w-3 h-3 text-primary absolute -top-1 -right-1" />}
          </Button>
          <div className="w-px h-5 bg-border/50 hidden xs:block" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNote}
            className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-accent/20 hover:text-accent rounded-lg relative"
          >
            <StickyNote className="w-4 h-4" />
            <span className="hidden sm:inline">Note</span>
            {!isPro && <Crown className="w-3 h-3 text-primary absolute -top-1 -right-1" />}
          </Button>
          {onAISuggest && (
            <>
              <div className="w-px h-5 bg-border/50 hidden xs:block" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAISuggest}
                className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-violet-500/20 hover:text-violet-500 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI</span>
              </Button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}