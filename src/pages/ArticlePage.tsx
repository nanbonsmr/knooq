import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  StickyNote, 
  ExternalLink,
  Loader2,
  Clock,
  ChevronDown
} from 'lucide-react';
import Header from '@/components/Header';
import NotePanel from '@/components/NotePanel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getArticle, getArticleContent, WikiArticle } from '@/lib/wikipedia';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

export default function ArticlePage() {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const { 
    addRecentArticle, 
    addBookmark, 
    removeBookmark, 
    isBookmarked, 
    setNotePanelOpen,
    isNotePanelOpen
  } = useStore();

  const bookmarked = article ? isBookmarked(article.pageid) : false;

  useEffect(() => {
    async function fetchArticle() {
      if (!title) return;
      
      setIsLoading(true);
      try {
        const decodedTitle = decodeURIComponent(title);
        const [articleData, content] = await Promise.all([
          getArticle(decodedTitle),
          getArticleContent(decodedTitle),
        ]);

        if (articleData) {
          setArticle(articleData);
          addRecentArticle({
            title: articleData.title,
            pageid: articleData.pageid,
            extract: articleData.extract,
            content: '',
            thumbnail: articleData.thumbnail?.source,
          });
        }

        if (content) {
          // Process HTML content for styling
          const processedContent = processWikiContent(content);
          setHtmlContent(processedContent);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
        toast({
          title: 'Error',
          description: 'Failed to load article. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [title, addRecentArticle]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadProgress(Math.min(progress, 100));
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleBookmark = () => {
    if (!article) return;
    
    if (bookmarked) {
      removeBookmark(article.pageid);
      toast({ title: 'Bookmark removed' });
    } else {
      addBookmark({
        title: article.title,
        pageid: article.pageid,
        extract: article.extract,
        content: '',
        thumbnail: article.thumbnail?.source,
      });
      toast({ title: 'Article bookmarked!' });
    }
  };

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await navigator.share({
        title: article.title,
        text: article.extract,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const handleOpenWikipedia = () => {
    if (article?.content_urls?.desktop.page) {
      window.open(article.content_urls.desktop.page, '_blank');
    } else if (title) {
      window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NotePanel articleTitle={article?.title} articleId={String(article?.pageid)} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <motion.div
          className="h-full bg-gradient-primary"
          style={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <main className={`relative z-10 pt-24 pb-20 transition-all duration-300 ${isNotePanelOpen ? 'mr-[400px]' : ''}`}>
        <div className="container mx-auto px-6">
          {/* Back button and actions */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className="rounded-full"
              >
                {bookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-primary" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotePanelOpen(!isNotePanelOpen)}
                className="rounded-full"
              >
                <StickyNote className={`w-5 h-5 ${isNotePanelOpen ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenWikipedia}
                className="rounded-full"
              >
                <ExternalLink className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-muted-foreground">Loading article...</p>
              </div>
            </div>
          ) : article ? (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              {/* Article Header */}
              <header className="mb-8">
                {article.thumbnail && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8"
                  >
                    <img
                      src={article.thumbnail.source}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  </motion.div>
                )}

                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {article.title}
                </h1>

                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {Math.ceil(article.extract.split(' ').length / 200)} min read
                    </span>
                  </div>
                </div>

                {/* Summary card */}
                <div className="glass-card rounded-2xl p-6 mb-8">
                  <h2 className="text-lg font-semibold text-primary mb-3">Summary</h2>
                  <p className="text-foreground/90 leading-relaxed">{article.extract}</p>
                </div>

                {/* Scroll indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <span className="text-sm">Scroll for full article</span>
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </motion.div>
              </header>

              {/* Full Article Content */}
              {htmlContent && (
                <ScrollArea ref={contentRef} className="max-h-[70vh]">
                  <div
                    className="wiki-content prose prose-invert prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </ScrollArea>
              )}
            </motion.article>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Article not found</p>
            </div>
          )}
        </div>
      </main>

      {/* Wiki content styles */}
      <style>{`
        .wiki-content {
          color: hsl(var(--foreground));
        }
        .wiki-content h1,
        .wiki-content h2,
        .wiki-content h3,
        .wiki-content h4 {
          color: hsl(var(--foreground));
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .wiki-content h2 {
          font-size: 1.75rem;
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }
        .wiki-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
          color: hsl(var(--foreground) / 0.9);
        }
        .wiki-content a {
          color: hsl(var(--primary));
          text-decoration: none;
        }
        .wiki-content a:hover {
          text-decoration: underline;
        }
        .wiki-content ul,
        .wiki-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .wiki-content li {
          margin-bottom: 0.5rem;
        }
        .wiki-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .wiki-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .wiki-content th,
        .wiki-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
        }
        .wiki-content th {
          background: hsl(var(--secondary));
        }
        .wiki-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .wiki-content figure {
          margin: 1.5rem 0;
        }
        .wiki-content figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          margin-top: 0.5rem;
        }
        .wiki-content .infobox,
        .wiki-content .navbox,
        .wiki-content .mw-references-wrap {
          display: none;
        }
      `}</style>
    </div>
  );
}

function processWikiContent(html: string): string {
  // Create a temporary element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove unwanted elements
  const selectorsToRemove = [
    '.mw-editsection',
    '.reference',
    '.navbox',
    '.sistersitebox',
    '.mbox-small',
    '.noprint',
    'style',
    'script',
    '.mw-empty-elt',
  ];

  selectorsToRemove.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Get the main content
  const content = doc.querySelector('.mw-parser-output') || doc.body;

  return content.innerHTML;
}
