import { motion } from 'framer-motion';
import { BookMarked, Trash2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Bookmarks</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Your saved articles</p>
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <BookMarked className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No bookmarks yet</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
                Save articles to read later by clicking the bookmark icon
              </p>
              <Button onClick={() => navigate('/')}>Explore Articles</Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {bookmarks.map((article, index) => (
                <motion.article
                  key={article.pageid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group"
                >
                  {article.thumbnail ? (
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg sm:rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg sm:rounded-xl bg-gradient-primary flex-shrink-0 flex items-center justify-center">
                      <span className="text-3xl sm:text-2xl font-bold text-white">{article.title[0]}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 w-full">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-1 sm:truncate">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                      {article.extract}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBookmark(article.pageid)}
                      className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <Button
                      onClick={() => navigate(`/article/${encodeURIComponent(article.title)}`)}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      Read
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
