import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, StickyNote, Highlighter, BookOpen, Sparkles } from 'lucide-react';

interface ArticleFABProps {
  highlightsCount: number;
  onOpenNotes: () => void;
  onOpenHighlights: () => void;
  onToggleStudyMode: () => void;
  isStudyMode: boolean;
  isPro?: boolean;
}

export default function ArticleFAB({
  highlightsCount,
  onOpenNotes,
  onOpenHighlights,
  onToggleStudyMode,
  isStudyMode,
  isPro = false,
}: ArticleFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const actions = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: isStudyMode ? 'Exit Study' : 'Study Mode',
      onClick: onToggleStudyMode,
      active: isStudyMode,
      color: 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30',
    },
    {
      icon: <Highlighter className="w-5 h-5" />,
      label: 'Highlights',
      onClick: onOpenHighlights,
      count: highlightsCount,
      color: 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30',
      requiresPro: true,
    },
    {
      icon: <StickyNote className="w-5 h-5" />,
      label: 'Notes',
      onClick: onOpenNotes,
      color: 'bg-primary/20 text-primary hover:bg-primary/30',
      requiresPro: true,
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Action items */}
            <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3">
              {actions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: (actions.length - 1 - index) * 0.05 }}
                  onClick={() => handleAction(action.onClick)}
                  className={`flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-colors ${
                    action.active
                      ? 'bg-primary text-primary-foreground'
                      : action.color
                  }`}
                >
                  <span className="text-sm font-medium whitespace-nowrap flex items-center gap-1.5">
                    {action.label}
                    {action.requiresPro && !isPro && (
                      <Sparkles className="w-3 h-3 text-primary" />
                    )}
                  </span>
                  <div className="relative">
                    {action.icon}
                    {action.count !== undefined && action.count > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                        {action.count > 9 ? '9+' : action.count}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-secondary text-foreground'
            : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
        
        {/* Notification dot */}
        {!isOpen && highlightsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] flex items-center justify-center font-bold">
            {highlightsCount > 9 ? '9+' : highlightsCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
