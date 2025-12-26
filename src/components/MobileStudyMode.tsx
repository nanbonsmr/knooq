import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, StickyNote } from 'lucide-react';

interface MobileStudyModeProps {
  articleContent: React.ReactNode;
  notesPanel: React.ReactNode;
}

export default function MobileStudyMode({ articleContent, notesPanel }: MobileStudyModeProps) {
  const [activePanel, setActivePanel] = useState<'article' | 'notes'>('article');

  const panels = [
    { id: 'article', label: 'Article', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border/30 bg-background/95 backdrop-blur-sm">
        {panels.map((panel) => {
          const Icon = panel.icon;
          const isActive = activePanel === panel.id;
          return (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{panel.label}</span>
              {isActive && (
                <motion.div
                  layoutId="study-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activePanel === 'article' ? (
            <motion.div
              key="article"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-auto"
            >
              {articleContent}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-hidden"
            >
              {notesPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Panel indicator dots */}
      <div className="flex items-center justify-center gap-2 py-3 bg-background/95 border-t border-border/30">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`w-2 h-2 rounded-full transition-all ${
              activePanel === panel.id 
                ? 'bg-primary w-6' 
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
