import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, BookMarked, BookOpen, Download, User, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';

export default function MobileBottomNav() {
  const location = useLocation();
  const { notes, bookmarks } = useStore();
  const { user } = useAuth();

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
      label: 'Install',
      path: '/install',
      active: location.pathname === '/install',
    },
    {
      icon: User,
      label: user ? 'Account' : 'Sign in',
      path: user ? '/dashboard' : '/auth',
      active: location.pathname === '/dashboard' || location.pathname === '/auth',
    },
  ];

  // Don't show on article pages to avoid clutter
  const hideOnPaths = ['/article'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  return (
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
        </div>
      </div>
    </nav>
  );
}
