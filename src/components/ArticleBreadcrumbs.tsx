import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function ArticleBreadcrumbs() {
  const { breadcrumbs, navigateToBreadcrumb } = useStore();
  const navigate = useNavigate();

  if (breadcrumbs.length === 0) return null;

  const handleBreadcrumbClick = (index: number, path: string) => {
    navigateToBreadcrumb(index);
    navigate(path);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide pb-2"
      aria-label="Breadcrumb"
    >
      {/* Home */}
      <Link
        to="/"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex-shrink-0"
      >
        <Home className="w-4 h-4" />
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
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <button
            onClick={() => handleBreadcrumbClick(index, crumb.path)}
            className={cn(
              "px-2 py-1 rounded-lg transition-colors max-w-[150px] truncate",
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
