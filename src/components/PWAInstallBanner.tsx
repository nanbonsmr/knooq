import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    // Check if already installed or in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if mobile device
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    if (!checkMobile) return;

    // Show banner after a short delay for better UX
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 3000);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
        >
          <div className="relative bg-gradient-to-r from-primary/90 to-primary rounded-2xl p-4 shadow-lg shadow-primary/20 border border-primary-foreground/10">
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-sm">
                  Install Knooq App
                </h3>
                <p className="text-primary-foreground/80 text-xs mt-0.5">
                  Add to home screen for the best experience
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  {deferredPrompt ? (
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-8 text-xs px-3"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Install Now
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      asChild
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-8 text-xs px-3"
                    >
                      <Link to="/install" onClick={() => setShowBanner(false)}>
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        How to Install
                      </Link>
                    </Button>
                  )}
                  <button
                    onClick={handleDismiss}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-xs font-medium"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
