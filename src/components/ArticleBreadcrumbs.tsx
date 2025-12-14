import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function ArticleBreadcrumbs() {
  const { breadcrumbs, navigateToBreadcrumb } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (breadcrumbs.length === 0) return null;

  // Find current index in breadcrumbs based on current path
  const currentIndex = breadcrumbs.findIndex(crumb => crumb.path === location.pathname);

  const handleBreadcrumbClick = (index: number, path: string) => {
    navigateToBreadcrumb(index);
    navigate(path);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        // Navigate to previous breadcrumb
        if (currentIndex > 0) {
          const prevCrumb = breadcrumbs[currentIndex - 1];
          navigateToBreadcrumb(currentIndex - 1);
          navigate(prevCrumb.path);
          toast({
            title: 'Navigated back',
            description: prevCrumb.title,
          });
        } else if (currentIndex === 0 || breadcrumbs.length > 0) {
          // Go to home
          navigate('/');
          toast({
            title: 'Navigated to Home',
          });
        }
      } else if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        // Navigate to next breadcrumb (if exists)
        if (currentIndex < breadcrumbs.length - 1 && currentIndex >= 0) {
          const nextCrumb = breadcrumbs[currentIndex + 1];
          navigate(nextCrumb.path);
          toast({
            title: 'Navigated forward',
            description: nextCrumb.title,
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [breadcrumbs, currentIndex, navigate, navigateToBreadcrumb]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-xs sm:text-sm overflow-x-auto scrollbar-hide pb-2 mb-2"
      aria-label="Breadcrumb (Alt+← / Alt+→ to navigate)"
    >
      {/* Home */}
      <Link
        to="/"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex-shrink-0"
      >
        <Home className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <motion.div
          key={`${crumb.path}-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-1 flex-shrink-0"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/50" />
          <button
            onClick={() => handleBreadcrumbClick(index, crumb.path)}
            className={cn(
              "px-2 py-1 rounded-lg transition-colors max-w-[100px] sm:max-w-[150px] truncate text-xs sm:text-sm",
              index === breadcrumbs.length - 1
                ? "text-primary font-medium bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
            title={crumb.title}
          >
            {crumb.title}
          </button>
        </motion.div>
      ))}
    </motion.nav>
  );
}
