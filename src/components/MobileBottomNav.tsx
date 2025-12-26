import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, BookMarked, BookOpen, Download, User, MoreHorizontal, Crown, LogOut, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function MobileBottomNav() {
  const location = useLocation();
  const { notes, bookmarks } = useStore();
  const { user, signOut } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const navItems = [
    {
      icon: Compass,
      label: 'Explore',
      path: '/',
      active: location.pathname === '/',
    },
    {
      icon: BookMarked,
      label: 'Bookmarks',
      path: '/bookmarks',
      count: bookmarks.length,
      active: location.pathname === '/bookmarks',
    },
    {
      icon: BookOpen,
      label: 'Notes',
      path: '/notes',
      count: notes.length,
      active: location.pathname === '/notes',
    },
    {
      icon: Download,
      label: 'Offline',
      path: '/offline',
      active: location.pathname === '/offline',
    },
  ];

  // Don't show on article pages to avoid clutter
  const hideOnPaths = ['/article'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  const handleSignOut = async () => {
    await signOut();
    setShowMore(false);
  };

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 right-4 z-50 md:hidden bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]"
            >
              <Link
                to="/pricing"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">Pricing</span>
              </Link>
              <Link
                to={user ? '/dashboard' : '/auth'}
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">{user ? 'Account' : 'Sign in'}</span>
              </Link>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors w-full text-left border-t border-border"
                >
                  <LogOut className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Sign out</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-lg border-t border-border/50" />
        
        {/* Safe area padding for notched devices */}
        <div className="relative px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors"
                >
                  {/* Active indicator */}
                  {item.active && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon with badge */}
                  <div className="relative z-10">
                    <Icon 
                      className={`w-5 h-5 transition-colors ${
                        item.active ? 'text-primary' : 'text-muted-foreground'
                      }`} 
                    />
                    {item.count !== undefined && item.count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                        {item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={`text-[10px] font-medium transition-colors z-10 ${
                      item.active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
            
            {/* More button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors"
            >
              {showMore && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                {showMore ? (
                  <X className="w-5 h-5 text-primary" />
                ) : (
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span 
                className={`text-[10px] font-medium transition-colors z-10 ${
                  showMore ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
