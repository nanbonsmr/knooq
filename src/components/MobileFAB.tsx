import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, StickyNote, BookMarked, Compass } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notes, bookmarks } = useStore();

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const actions = [
    {
      icon: <Compass className="w-5 h-5" />,
      label: 'Explore',
      path: '/',
      active: location.pathname === '/',
    },
    {
      icon: <BookMarked className="w-5 h-5" />,
      label: 'Bookmarks',
      path: '/bookmarks',
      count: bookmarks.length,
      active: location.pathname === '/bookmarks',
    },
    {
      icon: <StickyNote className="w-5 h-5" />,
      label: 'Notes',
      path: '/notes',
      count: notes.length,
      active: location.pathname === '/notes',
    },
  ];

  return (
    <div className="fixed bottom-6 right-4 z-40 md:hidden">
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
                  key={action.path}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: (actions.length - 1 - index) * 0.05 }}
                  onClick={() => handleNavigate(action.path)}
                  className={`flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-colors ${
                    action.active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/90 text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                  <div className="relative">
                    {action.icon}
                    {action.count !== undefined && action.count > 0 && (
                      <span className={`absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-medium ${
                        action.active
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-primary text-primary-foreground'
                      }`}>
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
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen
            ? 'bg-secondary text-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
}