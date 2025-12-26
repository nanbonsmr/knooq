import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  StickyNote, 
  ExternalLink,
  Loader2,
  Clock,
  ChevronDown,
  BookOpen,
  X,
  Trash2,
  Highlighter,
  Crown,
  WifiOff,
  Download,
  CheckCircle2
} from 'lucide-react';
import Header from '@/components/Header';
import NotePanel from '@/components/NotePanel';
import StudyWorkspace from '@/components/StudyWorkspace';
import MobileStudyMode from '@/components/MobileStudyMode';
import ImageLightbox from '@/components/ImageLightbox';
import TableOfContents from '@/components/TableOfContents';
import TextSelectionTooltip from '@/components/TextSelectionTooltip';
import HighlightsPanel from '@/components/HighlightsPanel';
import ArticleBreadcrumbs from '@/components/ArticleBreadcrumbs';
import AISummary from '@/components/AISummary';
import AIChatAssistant from '@/components/AIChatAssistant';
import AINoteSuggestions from '@/components/AINoteSuggestions';
import { ProGate, ProBadge } from '@/components/ProGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useHighlights } from '@/hooks/useHighlights';
import { useNotes } from '@/hooks/useNotes';
import { useOfflineArticles } from '@/hooks/useOfflineArticles';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { getArticle, getArticleContent, getRelatedArticles, WikiArticle, WikiSearchResult } from '@/lib/wikipedia';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

export default function ArticlePage() {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState<WikiSearchResult[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { 
    addRecentArticle, 
    addBookmark, 
    removeBookmark, 
    isBookmarked, 
    setNotePanelOpen,
    isNotePanelOpen,
    isStudyMode,
    setStudyMode,
    addBreadcrumb
  } = useStore();

  // Use synced highlights and notes hooks
  const { 
    highlights, 
    addHighlight: addHighlightToDb, 
    removeHighlight: removeHighlightFromDb 
  } = useHighlights(article?.title, article ? String(article.pageid) : undefined);
  
  const { addNote: addNoteToDb } = useNotes(article?.title, article ? String(article.pageid) : undefined);

  const { 
    isOnline, 
    saveArticleForOffline, 
    isArticleCached, 
    removeArticleFromCache,
    getOfflineArticle 
  } = useOfflineArticles();

  const { isPro } = useSubscription();
  const isMobile = useIsMobile();
  const bookmarked = article ? isBookmarked(article.pageid) : false;
  const isOfflineCached = article ? isArticleCached(article.title) : false;
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [highlightTooltipPos, setHighlightTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isHighlightsPanelOpen, setIsHighlightsPanelOpen] = useState(false);
  const [aiSuggestText, setAiSuggestText] = useState<string | null>(null);
  const { recentArticles } = useStore();

  // Get article highlights count
  const articleHighlightsCount = highlights.length;
  
  // Get navigation articles (recent articles excluding current)
  const navigationArticles = recentArticles.filter(a => a.title !== article?.title).slice(0, 10);
  const currentIndex = navigationArticles.findIndex(a => a.title === article?.title);
  
  // Swipe navigation handlers

  useEffect(() => {
    async function fetchArticle() {
      if (!title) return;
      
      setIsLoading(true);
      const decodedTitle = decodeURIComponent(title);
      
      // Check if offline and we have cached content
      if (!isOnline) {
        const cachedArticle = getOfflineArticle(decodedTitle);
        if (cachedArticle) {
          setArticle({
            title: cachedArticle.title,
            pageid: 0,
            extract: cachedArticle.content.substring(0, 500),
            content_urls: { desktop: { page: '' }, mobile: { page: '' } },
          } as WikiArticle);
          setHtmlContent(cachedArticle.content);
          setIsLoading(false);
          toast({
            title: 'Offline Mode',
            description: 'Showing cached version of this article.',
          });
          return;
        }
      }
      
      try {
        const [articleData, content, related] = await Promise.all([
          getArticle(decodedTitle),
          getArticleContent(decodedTitle),
          getRelatedArticles(decodedTitle),
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
          // Add to breadcrumb trail
          addBreadcrumb({
            title: articleData.title,
            path: `/article/${encodeURIComponent(articleData.title)}`,
          });
        }

        if (content) {
          const processedContent = processWikiContent(content);
          setHtmlContent(processedContent);
        }

        setRelatedArticles(related);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        
        // Try to load from cache on error
        const cachedArticle = getOfflineArticle(decodedTitle);
        if (cachedArticle) {
          setArticle({
            title: cachedArticle.title,
            pageid: 0,
            extract: cachedArticle.content.substring(0, 500),
            content_urls: { desktop: { page: '' }, mobile: { page: '' } },
          } as WikiArticle);
          setHtmlContent(cachedArticle.content);
          toast({
            title: 'Loaded from cache',
            description: 'Showing cached version due to network error.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load article. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [title, addRecentArticle, isOnline, getOfflineArticle]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadProgress(Math.min(Math.max(progress, 0), 100));
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [htmlContent]);

  // Apply highlights to content - highlights from hook are already filtered by article
  const highlightedContent = useCallback(() => {
    if (!htmlContent || highlights.length === 0) return htmlContent;
    
    let content = htmlContent;
    highlights.forEach((highlight) => {
      const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'gi');
      content = content.replace(
        regex,
        `<mark class="highlight-marker" data-highlight-id="${highlight.id}">$1</mark>`
      );
    });
    return content;
  }, [htmlContent, highlights]);

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

  const handleSaveForOffline = () => {
    if (!article || !htmlContent) return;
    
    if (isOfflineCached) {
      removeArticleFromCache(article.title);
    } else {
      saveArticleForOffline(article.title, htmlContent);
    }
  };

  // Make text draggable for study mode
  const handleDragStart = (e: React.DragEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      e.dataTransfer.setData('text/plain', selection.toString());
    }
  };

  // Handle text highlight
  const handleHighlight = useCallback((text: string) => {
    if (article) {
      addHighlightToDb({
        text,
        color: 'yellow',
      });
    }
  }, [article, addHighlightToDb]);

  // Handle add note from selection
  const handleAddNoteFromSelection = useCallback((text: string) => {
    if (article) {
      addNoteToDb({
        content: '',
        highlightedText: text,
        tags: [],
      });
      if (!isStudyMode) {
        setNotePanelOpen(true);
      }
    }
  }, [article, addNoteToDb, isStudyMode, setNotePanelOpen]);

  // Handle image clicks for lightbox
  const handleImageClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const src = img.src;
      const alt = img.alt || img.closest('figure')?.querySelector('figcaption')?.textContent || '';
      if (src && !src.includes('svg')) {
        e.preventDefault();
        e.stopPropagation();
        setLightboxImage({ src, alt });
      }
    }
  }, []);

  // Handle internal link navigation
  const handleLinkClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[data-internal-link="true"]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        navigate(href);
      }
    }
  }, [navigate]);

  // Handle highlight click for deletion
  const handleHighlightClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlight-marker')) {
      e.preventDefault();
      e.stopPropagation();
      const highlightId = target.getAttribute('data-highlight-id');
      if (highlightId) {
        const rect = target.getBoundingClientRect();
        setActiveHighlightId(highlightId);
        setHighlightTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      }
    } else {
      setActiveHighlightId(null);
      setHighlightTooltipPos(null);
    }
  }, []);

  const handleDeleteHighlight = useCallback(() => {
    if (activeHighlightId) {
      removeHighlightFromDb(activeHighlightId);
      setActiveHighlightId(null);
      setHighlightTooltipPos(null);
    }
  }, [activeHighlightId, removeHighlightFromDb]);

  // Navigate to a specific highlight in the article
  const handleNavigateToHighlight = useCallback((highlightId: string) => {
    const container = articleContentRef.current;
    if (container) {
      const highlightEl = container.querySelector(`[data-highlight-id="${highlightId}"]`);
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash animation
        highlightEl.classList.add('highlight-flash');
        setTimeout(() => {
          highlightEl.classList.remove('highlight-flash');
        }, 2000);
      }
    }
  }, []);

  // Attach click listener to article content for images, highlights, and links
  useEffect(() => {
    const container = articleContentRef.current;
    if (container) {
      container.addEventListener('click', handleImageClick);
      container.addEventListener('click', handleHighlightClick);
      container.addEventListener('click', handleLinkClick);
      return () => {
        container.removeEventListener('click', handleImageClick);
        container.removeEventListener('click', handleHighlightClick);
        container.removeEventListener('click', handleLinkClick);
      };
    }
  }, [handleImageClick, handleHighlightClick, handleLinkClick, htmlContent]);

  const ArticleContent = () => (
    <div className={`h-full overflow-auto ${isStudyMode ? 'pt-4 px-3 sm:px-6' : 'container mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-20'}`}>
      {/* Breadcrumb navigation */}
      {!isStudyMode && <ArticleBreadcrumbs />}
      
      {/* Back button and actions */}
      <div className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-1 sm:gap-2 text-muted-foreground hover:text-foreground px-2 sm:px-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          {/* Study Mode - Pro only */}
          <Button
            variant={isStudyMode ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              if (!isPro) {
                toast({ 
                  title: 'Pro Feature', 
                  description: 'Upgrade to Pro to use Study Mode',
                  action: <a href="/pricing" className="text-primary hover:underline">Upgrade</a>
                });
                return;
              }
              setStudyMode(!isStudyMode);
            }}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 relative"
            title="Study Mode (Pro)"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            {!isPro && <Crown className="w-3 h-3 text-primary absolute -top-0.5 -right-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
          >
            {bookmarked ? (
              <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveForOffline}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
            title={isOfflineCached ? "Remove from offline" : "Save for offline"}
          >
            {isOfflineCached ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            ) : (
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
          {!isStudyMode && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHighlightsPanelOpen(!isHighlightsPanelOpen)}
                className="rounded-full relative hidden sm:flex w-8 h-8 sm:w-10 sm:h-10"
              >
                <Highlighter className={`w-4 h-4 sm:w-5 sm:h-5 ${isHighlightsPanelOpen ? 'text-yellow-500' : ''}`} />
                {articleHighlightsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-background text-xs rounded-full flex items-center justify-center font-medium">
                    {articleHighlightsCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotePanelOpen(!isNotePanelOpen)}
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
              >
                <StickyNote className={`w-4 h-4 sm:w-5 sm:h-5 ${isNotePanelOpen ? 'text-primary' : ''}`} />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenWikipedia}
            className="rounded-full hidden sm:flex w-8 h-8 sm:w-10 sm:h-10"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
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
          className={isStudyMode ? '' : 'max-w-4xl mx-auto'}
        >
          {/* Article Header */}
          <header className="mb-8">
            {article.thumbnail && !isStudyMode && (
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

            <h1 className={`font-bold text-foreground mb-4 ${isStudyMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'}`}>
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {Math.ceil(article.extract.split(' ').length / 200)} min read
                </span>
              </div>
              {isStudyMode && (
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Study Mode Active</span>
                </div>
              )}
            </div>

            {/* AI Summary - Pro Only */}
            {!isStudyMode && (
              <div className="mb-6">
                <ProGate featureName="AI summaries" fallback={
                  <div className="glass-card rounded-2xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ProBadge />
                      <span className="text-sm text-muted-foreground">AI Summary available for Pro users</span>
                    </div>
                  </div>
                }>
                  <AISummary title={article.title} content={article.extract + '\n\n' + htmlContent} />
                </ProGate>
              </div>
            )}

            {/* Summary card */}
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-primary mb-3">Summary</h2>
              <p 
                className="text-foreground/90 leading-relaxed select-text"
                draggable={isStudyMode}
                onDragStart={handleDragStart}
              >
                {article.extract}
              </p>
            </div>

            {/* Scroll indicator - only show when not in study mode */}
            {!isStudyMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-2 text-muted-foreground"
              >
                <span className="text-sm">Scroll for full article</span>
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </motion.div>
            )}
          </header>

          {/* Full Article Content */}
          {htmlContent && (
            <div 
              ref={scrollContainerRef}
              className={`overflow-y-auto scroll-smooth ${isStudyMode ? 'h-[calc(100vh-400px)] study-mode-content' : 'h-[70vh]'}`}
            >
              <div
                ref={articleContentRef}
                className="wiki-content prose prose-invert prose-lg max-w-none select-text pr-4"
                dangerouslySetInnerHTML={{ __html: highlightedContent() }}
              />
              {isStudyMode && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground text-center mt-4 py-3 px-4 rounded-lg bg-primary/5 border border-primary/10 mx-4">
                  <span className="inline-block w-3 h-3 rounded bg-primary/50 animate-pulse" />
                  <span>Select text and drag it to the Study Notes panel to create a note</span>
                </div>
              )}
            </div>
          )}
        </motion.article>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Article not found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      {!isStudyMode && <NotePanel articleTitle={article?.title} articleId={String(article?.pageid)} />}
      
      {/* AI Chat Assistant - Pro Only */}
      {isPro && (
        <AIChatAssistant 
          articleContext={article ? {
            title: article.title,
            content: htmlContent,
            extract: article.extract,
          } : null}
        />
      )}
      
      {/* Highlights Panel */}
      {!isStudyMode && (
        <HighlightsPanel
          articleId={String(article?.pageid)}
          articleTitle={article?.title}
          isOpen={isHighlightsPanelOpen}
          onClose={() => setIsHighlightsPanelOpen(false)}
          onNavigateToHighlight={handleNavigateToHighlight}
        />
      )}

      {/* Text Selection Tooltip */}
      <TextSelectionTooltip
        containerRef={articleContentRef}
        onHighlight={handleHighlight}
        onAddNote={handleAddNoteFromSelection}
        onAISuggest={(text) => setAiSuggestText(text)}
      />

      {/* AI Note Suggestions Modal - Pro Only */}
      {aiSuggestText && article && isPro && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <AINoteSuggestions
              highlightedText={aiSuggestText}
              articleTitle={article.title}
              articleId={String(article.pageid)}
              articleContent={htmlContent}
              onClose={() => setAiSuggestText(null)}
            />
          </div>
        </div>
      )}

      {/* AI Note Suggestions - Non-Pro Fallback */}
      {aiSuggestText && article && !isPro && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm" onClick={() => setAiSuggestText(null)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <ProGate featureName="AI note suggestions" />
          </div>
        </div>
      )}
      <AnimatePresence>
        {activeHighlightId && highlightTooltipPos && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] flex items-center gap-1 p-1.5 rounded-xl glass-card border border-border/50 shadow-lg"
            style={{
              left: `${highlightTooltipPos.x}px`,
              top: `${highlightTooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteHighlight}
              className="h-8 px-3 gap-2 text-sm hover:bg-destructive/20 hover:text-destructive rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Remove Highlight
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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

      {isStudyMode ? (
        /* Study Mode - Desktop: Split View, Mobile: Swipeable Panels */
        <main className="relative z-10 pt-20 h-screen">
          {/* Desktop Study Mode */}
          <div className="hidden md:block h-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={60} minSize={40}>
                <div className="h-full overflow-auto glass border-r border-border/30">
                  <ArticleContent />
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle className="bg-border/30 hover:bg-primary/30 transition-colors" />
              
              <ResizablePanel defaultSize={40} minSize={25}>
                <div className="h-full glass">
                  <StudyWorkspace 
                    articleTitle={article?.title} 
                    articleId={String(article?.pageid)} 
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          
          {/* Mobile Study Mode */}
          <div className="md:hidden h-full">
            <MobileStudyMode
              articleContent={<ArticleContent />}
              notesPanel={
                <StudyWorkspace 
                  articleTitle={article?.title} 
                  articleId={String(article?.pageid)} 
                />
              }
            />
          </div>
        </main>
      ) : (
        /* Normal Mode */
        <main className={`relative z-10 transition-all duration-300 ${isNotePanelOpen ? 'mr-[400px]' : ''}`}>
          {/* Table of Contents - only show in normal mode with content */}
          {!isLoading && htmlContent && (
            <TableOfContents 
              contentRef={scrollContainerRef} 
              htmlContent={htmlContent} 
            />
          )}
          <ArticleContent />
        </main>
      )}


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
        .wiki-content .navbox,
        .wiki-content .mw-references-wrap {
          display: none;
        }
        .wiki-content .infobox {
          float: right;
          margin: 0 0 1rem 1.5rem;
          max-width: 300px;
          background: hsl(var(--secondary) / 0.5);
          border: 1px solid hsl(var(--border));
          border-radius: 1rem;
          padding: 1rem;
          font-size: 0.875rem;
        }
        .wiki-content .infobox th,
        .wiki-content .infobox td {
          padding: 0.5rem;
          border: none;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
        }
        .wiki-content .infobox img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .wiki-content .thumb {
          margin: 1.5rem auto;
          max-width: 100%;
        }
        .wiki-content .thumb.tright {
          float: right;
          margin: 0 0 1rem 1.5rem;
          max-width: 300px;
        }
        .wiki-content .thumb.tleft {
          float: left;
          margin: 0 1.5rem 1rem 0;
          max-width: 300px;
        }
        .wiki-content .thumbinner {
          background: hsl(var(--secondary) / 0.3);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 0.75rem;
          padding: 0.5rem;
        }
        .wiki-content .thumbcaption {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
          padding: 0.5rem;
          text-align: center;
        }
        .wiki-content ::selection {
          background: hsl(var(--primary) / 0.4);
        }
        @media (max-width: 768px) {
          .wiki-content .infobox,
          .wiki-content .thumb.tright,
          .wiki-content .thumb.tleft {
            float: none;
            margin: 1rem auto;
            max-width: 100%;
          }
        }
        .wiki-content img {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .wiki-content img:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 20px hsl(var(--primary) / 0.2);
        }
        .wiki-content .highlight-marker {
          background: linear-gradient(120deg, hsl(48 96% 53% / 0.4) 0%, hsl(48 96% 53% / 0.6) 100%);
          border-radius: 2px;
          padding: 0.1em 0.2em;
          margin: 0 -0.2em;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          transition: background 0.2s ease;
          cursor: pointer;
        }
        .wiki-content .highlight-marker:hover {
          background: linear-gradient(120deg, hsl(48 96% 53% / 0.6) 0%, hsl(48 96% 53% / 0.8) 100%);
          box-shadow: 0 0 0 2px hsl(48 96% 53% / 0.3);
        }
        .wiki-content .highlight-marker.highlight-flash {
          animation: highlight-pulse 2s ease-out;
        }
        @keyframes highlight-pulse {
          0%, 100% {
            background: linear-gradient(120deg, hsl(48 96% 53% / 0.4) 0%, hsl(48 96% 53% / 0.6) 100%);
            box-shadow: 0 0 0 0 hsl(48 96% 53% / 0);
          }
          25%, 75% {
            background: linear-gradient(120deg, hsl(48 96% 53% / 0.8) 0%, hsl(48 96% 53% / 1) 100%);
            box-shadow: 0 0 20px 4px hsl(48 96% 53% / 0.5);
          }
          50% {
            background: linear-gradient(120deg, hsl(48 96% 53% / 0.6) 0%, hsl(48 96% 53% / 0.8) 100%);
            box-shadow: 0 0 10px 2px hsl(48 96% 53% / 0.3);
          }
        }
      `}</style>

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || ''}
        alt={lightboxImage?.alt || ''}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}

function processWikiContent(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

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
    '.shortdescription',
    '.metadata',
    '.ambox',
    '.hatnote',
  ];

  selectorsToRemove.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Fix all image src URLs to be absolute
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('//')) {
      img.setAttribute('src', 'https:' + src);
    }
    // Also fix srcset
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      const fixedSrcset = srcset.replace(/\/\//g, 'https://');
      img.setAttribute('srcset', fixedSrcset);
    }
    // Add loading lazy
    img.setAttribute('loading', 'lazy');
  });

  // Convert Wikipedia links to internal app navigation
  doc.querySelectorAll('a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/wiki/')) {
      // Extract article title from /wiki/Article_Name
      const articleTitle = href.replace('/wiki/', '');
      // Skip special pages and file links
      if (!articleTitle.includes(':')) {
        link.setAttribute('href', `/article/${articleTitle}`);
        link.setAttribute('data-internal-link', 'true');
        link.removeAttribute('target');
        link.removeAttribute('rel');
      } else {
        // For special pages, open externally
        link.setAttribute('href', 'https://en.wikipedia.org' + href);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    } else if (href && href.startsWith('./')) {
      const articleTitle = href.slice(2);
      if (!articleTitle.includes(':')) {
        link.setAttribute('href', `/article/${articleTitle}`);
        link.setAttribute('data-internal-link', 'true');
        link.removeAttribute('target');
        link.removeAttribute('rel');
      } else {
        link.setAttribute('href', 'https://en.wikipedia.org/wiki/' + articleTitle);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    } else if (href && href.startsWith('#')) {
      // Keep anchor links as is
    } else if (href && !href.startsWith('http')) {
      // Other relative links, make them internal
      link.setAttribute('href', `/article/${href}`);
      link.setAttribute('data-internal-link', 'true');
    }
  });

  const content = doc.querySelector('.mw-parser-output') || doc.body;

  return content.innerHTML;
}
