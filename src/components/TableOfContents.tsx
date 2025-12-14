import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { List, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  htmlContent: string;
}

export default function TableOfContents({ contentRef, htmlContent }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract headings from content and add IDs to actual DOM
  useEffect(() => {
    if (!htmlContent) return;

    // Wait for DOM to be ready
    const timeout = setTimeout(() => {
      // Find the wiki-content container in the document
      const wikiContent = document.querySelector('.wiki-content');
      if (!wikiContent) return;

      const headingElements = wikiContent.querySelectorAll('h2, h3, h4');
      
      const items: TOCItem[] = [];
      let tocIndex = 0;
      
      headingElements.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        if (text && text.length > 0 && 
            !text.toLowerCase().includes('reference') && 
            !text.toLowerCase().includes('see also') &&
            !text.toLowerCase().includes('external links') &&
            !text.toLowerCase().includes('further reading')) {
          const id = `toc-heading-${tocIndex}`;
          heading.id = id;
          items.push({
            id,
            text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
            level: parseInt(heading.tagName[1]),
          });
          tocIndex++;
        }
      });
      
      setHeadings(items);
    }, 500);

    return () => clearTimeout(timeout);
  }, [htmlContent]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const wikiContent = document.querySelector('.wiki-content');
    if (!wikiContent) return;

    const headingElements = wikiContent.querySelectorAll('h2[id^="toc-"], h3[id^="toc-"], h4[id^="toc-"]');
    
    let currentId = '';
    headingElements.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 150) {
        currentId = heading.id;
      }
    });

    if (currentId) {
      setActiveId(currentId);
    }
  }, []);

  useEffect(() => {
    // Listen to scroll on window and any scrollable container
    window.addEventListener('scroll', handleScroll, true);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [handleScroll, htmlContent, headings]);

  const scrollToHeading = (id: string) => {
    const heading = document.getElementById(id);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "hidden lg:block fixed left-6 top-32 z-40 transition-all duration-300",
        isCollapsed ? "w-10" : "w-56"
      )}
    >
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-2 p-3 hover:bg-secondary/50 transition-colors"
        >
          <List className="w-4 h-4 text-primary flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium text-foreground flex-1 text-left">Contents</span>
          )}
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            !isCollapsed && "rotate-180"
          )} />
        </button>

        {/* Table of Contents */}
        {!isCollapsed && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-h-[60vh] overflow-y-auto px-2 pb-3"
          >
            <ul className="space-y-0.5">
              {headings.map((heading, index) => (
                <motion.li
                  key={heading.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-200 truncate",
                      heading.level === 2 && "font-medium",
                      heading.level === 3 && "pl-5 text-xs",
                      heading.level === 4 && "pl-7 text-xs",
                      activeId === heading.id
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {heading.text}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </div>

      {/* Progress indicator */}
      {!isCollapsed && headings.length > 0 && (
        <div className="mt-3 px-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%`
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span>{headings.findIndex(h => h.id === activeId) + 1}/{headings.length}</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
