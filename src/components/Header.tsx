import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Compass, BookMarked, Sparkles } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass border-b border-border/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Nexus</h1>
                <p className="text-xs text-muted-foreground -mt-1">Knowledge Platform</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" icon={<Compass className="w-4 h-4" />} active={isHome}>
                Explore
              </NavLink>
              <NavLink
                to="/bookmarks"
                icon={<BookMarked className="w-4 h-4" />}
                active={location.pathname === '/bookmarks'}
              >
                Bookmarks
              </NavLink>
              <NavLink
                to="/notes"
                icon={<BookOpen className="w-4 h-4" />}
                active={location.pathname === '/notes'}
              >
                Notes
              </NavLink>
            </nav>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-muted-foreground hidden sm:inline">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

function NavLink({ to, icon, children, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}
