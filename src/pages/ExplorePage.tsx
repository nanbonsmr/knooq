import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Sparkles, Zap, Loader2, Globe, ArrowRight, Clock, BookOpen, Star, Flame } from 'lucide-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import TopicCard from '@/components/TopicCard';
import NotePanel from '@/components/NotePanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTrendingArticles, getFeaturedArticle, getRandomArticles, getPopularThisWeek, WikiSearchResult, WikiArticle } from '@/lib/wikipedia';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';

// Fallback topics for initial display
const fallbackTopics: WikiSearchResult[] = [{
  pageid: 1,
  title: 'Quantum Computing',
  extract: 'Revolutionary computing paradigm using quantum mechanics',
  description: 'Technology'
}, {
  pageid: 2,
  title: 'Artificial Intelligence',
  extract: 'Machine intelligence simulating human cognitive functions',
  description: 'Technology'
}, {
  pageid: 3,
  title: 'Space Exploration',
  extract: 'The discovery and exploration of outer space',
  description: 'Science'
}, {
  pageid: 4,
  title: 'Climate Change',
  extract: 'Long-term shifts in global temperatures and weather patterns',
  description: 'Environment'
}, {
  pageid: 5,
  title: 'Renaissance',
  extract: 'A period of cultural, artistic, and intellectual rebirth',
  description: 'History'
}, {
  pageid: 6,
  title: 'Neuroplasticity',
  extract: 'The brain\'s ability to reorganize and form new connections',
  description: 'Science'
}];
const categories = [{
  name: 'Science',
  icon: '🔬',
  color: 'from-blue-500 to-cyan-400'
}, {
  name: 'Technology',
  icon: '💻',
  color: 'from-purple-500 to-pink-400'
}, {
  name: 'History',
  icon: '📜',
  color: 'from-amber-500 to-orange-400'
}, {
  name: 'Arts',
  icon: '🎨',
  color: 'from-rose-500 to-red-400'
}, {
  name: 'Nature',
  icon: '🌿',
  color: 'from-green-500 to-emerald-400'
}, {
  name: 'Philosophy',
  icon: '💭',
  color: 'from-indigo-500 to-violet-400'
}];
export default function ExplorePage() {
  const [trendingArticles, setTrendingArticles] = useState<WikiSearchResult[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<WikiArticle | null>(null);
  const [popularThisWeek, setPopularThisWeek] = useState<WikiSearchResult[]>([]);
  const [randomArticles, setRandomArticles] = useState<WikiSearchResult[]>(fallbackTopics);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleTrending, setVisibleTrending] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const {
    recentArticles,
    notes,
    highlights
  } = useStore();
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [trending, featured, popular, random] = await Promise.all([getTrendingArticles().catch(() => []), getFeaturedArticle().catch(() => null), getPopularThisWeek().catch(() => []), getRandomArticles(8).catch(() => [])]);
        if (trending.length > 0) setTrendingArticles(trending);
        if (featured) setFeaturedArticle(featured);
        if (popular.length > 0) setPopularThisWeek(popular);
        if (random.length > 0) setRandomArticles(random);else setRandomArticles(fallbackTopics);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  const handleCardClick = (title: string) => {
    navigate(`/article/${encodeURIComponent(title)}`);
  };
  const handleCategoryClick = (category: string) => {
    navigate(`/article/${encodeURIComponent(category)}`);
  };
  const loadMoreArticles = useCallback(() => {
    if (loadingMore || visibleTrending >= trendingArticles.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleTrending(prev => Math.min(prev + 8, trendingArticles.length));
      setLoadingMore(false);
    }, 500);
  }, [loadingMore, visibleTrending, trendingArticles.length]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore && visibleTrending < trendingArticles.length) {
        loadMoreArticles();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => observer.disconnect();
  }, [loadMoreArticles, loadingMore, visibleTrending, trendingArticles.length]);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* CSS-only animated background */}
      <AnimatedBackground />

      <Header />
      <NotePanel />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          ease: "easeOut"
        }} className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div initial={{
            scale: 0.9,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            delay: 0.2,
            duration: 0.5
          }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-foreground/90 font-medium">Explore the Universe of Knowledge</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">New</span>
            </motion.div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 tracking-tight">
              <span className="text-foreground">Welcome to </span>
              <span className="gradient-text text-glow relative">
                knooq
                <motion.span animate={{
                rotate: [0, 15, 0]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} className="absolute -top-2 -right-8 text-2xl">
                  ✨
                </motion.span>
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              Your futuristic knowledge companion. Explore millions of articles with an 
              <span className="text-primary font-medium"> immersive 3D experience</span>, 
              smart highlighting, and powerful note-taking.
            </p>

            {/* Search */}
            <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
              <SearchBar />
            </div>

            {/* Quick stats */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
              <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{recentArticles.length} articles read</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{highlights.length} highlights</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-accent" />
                <span>{notes.length} notes</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 1.5
        }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{
            y: [0, 10, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }} className="flex flex-col items-center gap-2 text-muted-foreground/60">
              <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
                <motion.div animate={{
                y: [0, 12, 0]
              }} transition={{
                duration: 1.5,
                repeat: Infinity
              }} className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        

        {/* Featured Article */}
        <AnimatePresence>
          {featuredArticle && <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="max-w-7xl mx-auto">
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Featured Today</h2>
                    <p className="text-sm text-muted-foreground">Hand-picked article of the day</p>
                  </div>
                </motion.div>

                <motion.article initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} whileHover={{
              y: -5
            }} onClick={() => handleCardClick(featuredArticle.title)} className="relative glass-card rounded-3xl overflow-hidden cursor-pointer group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex flex-col lg:flex-row">
                    {featuredArticle.thumbnail && <div className="lg:w-2/5 h-48 sm:h-64 lg:h-auto overflow-hidden relative">
                        <img src={featuredArticle.thumbnail.source} alt={featuredArticle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background lg:block hidden" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />
                      </div>}
                    <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                      <Badge className="w-fit mb-4 bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
                        <Star className="w-3 h-3 mr-1" />
                        Article of the Day
                      </Badge>
                      <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-4 mb-6 text-sm sm:text-base">
                        {featuredArticle.extract}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <span>Read article</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              </div>
            </section>}
        </AnimatePresence>

        {/* Popular This Week */}
        {popularThisWeek.length > 0 && <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Popular This Week</h2>
                  <p className="text-sm text-muted-foreground">Most viewed articles over the past 7 days</p>
                </div>
              </motion.div>

              <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {popularThisWeek.map((article, index) => <motion.div key={article.pageid} variants={itemVariants}>
                    <TopicCard article={article} index={index} size="md" />
                  </motion.div>)}
              </motion.div>
            </div>
          </section>}


        {/* Categories Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Explore by Category</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Dive into knowledge across different domains
              </p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category, index) => <motion.button key={category.name} variants={itemVariants} whileHover={{
              scale: 1.05,
              y: -5
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handleCategoryClick(category.name)} className="group relative p-4 sm:p-6 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <span className="text-2xl sm:text-3xl mb-2 block">{category.icon}</span>
                  <span className="text-sm sm:text-base font-medium text-foreground">{category.name}</span>
                </motion.button>)}
            </motion.div>
          </div>
        </section>

        {/* Quick Discover - Shows while loading or as fallback */}
        {(isLoading || trendingArticles.length === 0) && <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Quick Discover</h2>
                  {isLoading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                </div>
              </motion.div>

              <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {fallbackTopics.map((topic, index) => <motion.button key={topic.pageid} variants={itemVariants} whileHover={{
              scale: 1.02,
              y: -5
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handleCardClick(topic.title)} className="glass-card rounded-2xl p-5 sm:p-6 text-left group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {topic.description}
                        </Badge>
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-lg font-bold text-white">{topic.title[0]}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {topic.extract}
                      </p>
                    </div>
                  </motion.button>)}
              </motion.div>
            </div>
          </section>}

        {/* Recent Articles */}
        {recentArticles.length > 0}

        {/* Footer gradient with extra padding for mobile nav */}
        <div className="h-32 md:h-32 pb-20 md:pb-0 bg-gradient-to-t from-background to-transparent" />
      </main>
    </div>;
}