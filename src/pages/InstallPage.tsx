import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Share, PlusSquare, MoreVertical, Check, Apple, Chrome, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: <Smartphone className="w-5 h-5" />, text: 'Works offline' },
    { icon: <Download className="w-5 h-5" />, text: 'Fast loading' },
    { icon: <Check className="w-5 h-5" />, text: 'No app store needed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Explore</span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 sm:mb-6">
              <Download className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Install <span className="gradient-text">knooq</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Add knooq to your home screen for a native app experience with offline access.
            </p>
          </motion.div>

          {/* Status Cards */}
          {isStandalone || isInstalled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 text-center mb-8"
            >
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Already Installed!</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                knooq is already installed on your device. Enjoy the full app experience!
              </p>
            </motion.div>
          ) : (
          <>
              {/* Install Button - Always show prominently */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 sm:p-8 text-center mb-8"
              >
                <Button
                  onClick={handleInstallClick}
                  size="lg"
                  disabled={!deferredPrompt}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 disabled:opacity-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {deferredPrompt ? 'Install knooq Now' : 'Install knooq'}
                </Button>
                <p className="text-muted-foreground text-xs sm:text-sm mt-4">
                  {deferredPrompt 
                    ? 'Click the button above to install the app directly.'
                    : isIOS 
                      ? 'Follow the instructions below to install on iOS.'
                      : 'Use your browser menu to install, or follow the instructions below.'}
                </p>
              </motion.div>

              {/* iOS Instructions */}
              {isIOS && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Apple className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">Install on iOS</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Tap the Share button</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          Look for the <Share className="w-4 h-4 inline-block mx-1" /> icon at the bottom of Safari
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Scroll and tap "Add to Home Screen"</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          Look for the <PlusSquare className="w-4 h-4 inline-block mx-1" /> icon in the menu
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Tap "Add" to confirm</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          The app will now appear on your home screen
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Android Instructions */}
              {isAndroid && !deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Chrome className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">Install on Android</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Tap the menu button</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          Look for the <MoreVertical className="w-4 h-4 inline-block mx-1" /> icon in Chrome
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Tap "Install app" or "Add to Home screen"</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          This option appears in the menu
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Confirm the installation</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          The app will be added to your home screen
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Desktop Instructions */}
              {!isIOS && !isAndroid && !deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Chrome className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">Install on Desktop</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Look for the install icon</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          In Chrome, look for the <Download className="w-4 h-4 inline-block mx-1" /> icon in the address bar
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Click "Install"</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          Confirm the installation in the popup
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Launch from your apps</p>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          The app will open in its own window
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-lg font-bold mb-4 text-center">Why Install?</h3>
            <div className="grid grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-2">
                    {feature.icon}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}