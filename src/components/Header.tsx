import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Compass, BookMarked, Menu, X, LogIn, LogOut, User, Crown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isPro } = useSubscription();
  const isHome = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { to: '/', icon: <Compass className="w-5 h-5" />, label: 'Explore', active: isHome },
    { to: '/bookmarks', icon: <BookMarked className="w-5 h-5" />, label: 'Bookmarks', active: location.pathname === '/bookmarks' },
    { to: '/notes', icon: <BookOpen className="w-5 h-5" />, label: 'Notes', active: location.pathname === '/notes' },
    { to: '/pricing', icon: <Crown className="w-5 h-5" />, label: 'Pricing', active: location.pathname === '/pricing' },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="glass border-b border-border/30">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-2 sm:py-3 lg:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 group flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.7 }}
                  className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10"
                >
                  <img src={logo} alt="knooq Logo" className="w-full h-full object-contain" />
                </motion.div>
                <div>
                  <h1 className="text-base xs:text-lg sm:text-xl font-bold gradient-text">knooq</h1>
                  <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground -mt-0.5 sm:-mt-1 hidden xs:block">Knowledge Platform</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} icon={item.icon} active={item.active}>
                    {item.label}
                  </NavLink>
                ))}
                
                {/* Auth Button */}
                {!loading && (
                  <>
                    {user ? (
                      <div className="flex items-center gap-1.5 xl:gap-2 ml-2 xl:ml-4">
                        {isPro && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            Pro
                          </span>
                        )}
                        {!isPro && (
                          <Link to="/pricing">
                            <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 text-xs xl:text-sm px-2 xl:px-3">
                              <Crown className="w-3 h-3 xl:w-4 xl:h-4 mr-1" />
                              <span className="hidden xl:inline">Upgrade</span>
                              <span className="xl:hidden">Pro</span>
                            </Button>
                          </Link>
                        )}
                        <Link to="/dashboard" className="flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                          <User className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-primary" />
                          <span className="text-xs xl:text-sm text-muted-foreground truncate max-w-20 xl:max-w-32">
                            {user.email}
                          </span>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSignOut}
                          className="text-muted-foreground hover:text-foreground text-xs xl:text-sm px-2 xl:px-3"
                        >
                          <LogOut className="w-3.5 h-3.5 xl:w-4 xl:h-4 xl:mr-2" />
                          <span className="hidden xl:inline">Sign out</span>
                        </Button>
                      </div>
                    ) : (
                      <Link to="/auth" className="ml-2 xl:ml-4">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xs xl:text-sm px-3 xl:px-4"
                        >
                          <LogIn className="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1 xl:mr-2" />
                          Sign in
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Tablet Navigation - Icons only */}
              <nav className="hidden md:flex lg:hidden items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      item.active
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                  </Link>
                ))}
                
                {!loading && (
                  <>
                    {user ? (
                      <div className="flex items-center gap-1 ml-2">
                        <Link to="/dashboard" className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors" title={user.email}>
                          <User className="w-5 h-5 text-primary" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSignOut}
                          className="text-muted-foreground hover:text-foreground"
                          title="Sign out"
                        >
                          <LogOut className="w-5 h-5" />
                        </Button>
                      </div>
                    ) : (
                      <Link to="/auth" className="ml-2">
                        <Button size="icon" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                          <LogIn className="w-5 h-5" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-1.5 xs:p-2 rounded-xl hover:bg-secondary/50 transition-colors flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 xs:w-6 xs:h-6 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 glass border-l border-border/30 z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="knooq Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold gradient-text">knooq</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4">
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Link
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            item.active
                              ? 'bg-primary/20 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Auth Section */}
                <div className="p-4 border-t border-border/30">
                  {!loading && (
                    <>
                      {user ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={handleSignOut}
                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                          </Button>
                        </div>
                      ) : (
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign in
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-sm text-muted-foreground">Connected to Wikipedia</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
