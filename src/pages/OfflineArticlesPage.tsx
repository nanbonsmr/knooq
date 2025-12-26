import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Trash2, 
  ArrowLeft, 
  HardDrive, 
  FileText, 
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import Header from '@/components/Header';
import { useOfflineArticles } from '@/hooks/useOfflineArticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function OfflineArticlesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    cachedArticles,
    isOnline,
    removeArticleFromCache,
    clearAllCachedArticles,
    getCacheSize,
  } = useOfflineArticles();

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return cachedArticles;
    return cachedArticles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cachedArticles, searchQuery]);

  const cacheSize = getCacheSize();
  const maxCacheSize = 50 * 1024 * 1024; // 50MB soft limit for display
  const cachePercentage = Math.min((cacheSize / maxCacheSize) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-28 md:pb-20">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <WifiOff className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Offline Articles
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage articles saved for offline reading
          </p>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`glass-card rounded-2xl p-4 mb-6 flex items-center gap-3 ${
            isOnline ? 'border-green-500/30' : 'border-yellow-500/30'
          }`}
        >
          {isOnline ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-foreground">You are currently online</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-foreground">You are offline. Only cached articles are available.</span>
            </>
          )}
        </motion.div>

        {/* Cache Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Cache Storage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatBytes(cacheSize)} used
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cachePercentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`h-full rounded-full ${
                cachePercentage > 80 ? 'bg-yellow-500' : 'bg-primary'
              }`}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {cachedArticles.length} article{cachedArticles.length !== 1 ? 's' : ''} saved
            </span>
            {cachedArticles.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all offline articles?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {cachedArticles.length} saved articles from your device. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearAllCachedArticles}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </motion.div>

        {/* Search */}
        {cachedArticles.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search offline articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>
          </motion.div>
        )}

        {/* Articles List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredArticles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/50 mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No articles found' : 'No offline articles'}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'Save articles for offline reading by tapping the download icon on any article page'
                  }
                </p>
              </motion.div>
            ) : (
              filteredArticles.map((article, index) => (
                <motion.div
                  key={article.title}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                >
                  {/* Article Icon */}
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  {/* Article Info */}
                  <Link 
                    to={`/article/${encodeURIComponent(article.title)}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Saved {formatDate(article.timestamp)}</span>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArticleFromCache(article.title)}
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
