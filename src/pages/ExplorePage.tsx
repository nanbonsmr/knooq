import { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Zap, Loader2, Globe } from 'lucide-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import TopicCard from '@/components/TopicCard';
import NotePanel from '@/components/NotePanel';
import { getTrendingArticles, getFeaturedArticle, getRandomArticles, WikiSearchResult, WikiArticle } from '@/lib/wikipedia';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

const FloatingCards = lazy(() => import('@/components/three/FloatingCards'));

// Fallback topics for initial display
const fallbackTopics: WikiSearchResult[] = [
  { pageid: 1, title: 'Quantum Computing', extract: 'Revolutionary computing paradigm using quantum mechanics', description: 'Technology' },
  { pageid: 2, title: 'Artificial Intelligence', extract: 'Machine intelligence simulating human cognitive functions', description: 'Technology' },
  { pageid: 3, title: 'Space Exploration', extract: 'The discovery and exploration of outer space', description: 'Science' },
  { pageid: 4, title: 'Climate Change', extract: 'Long-term shifts in global temperatures and weather patterns', description: 'Environment' },
  { pageid: 5, title: 'Renaissance', extract: 'A period of cultural, artistic, and intellectual rebirth', description: 'History' },
  { pageid: 6, title: 'Neuroplasticity', extract: 'The brain\'s ability to reorganize and form new connections', description: 'Science' },
];

export default function ExplorePage() {
  const [trendingArticles, setTrendingArticles] = useState<WikiSearchResult[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<WikiArticle | null>(null);
  const [randomArticles, setRandomArticles] = useState<WikiSearchResult[]>(fallbackTopics);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { recentArticles } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setHasError(false);
      try {
        const [trending, featured, random] = await Promise.all([
          getTrendingArticles().catch(() => []),
          getFeaturedArticle().catch(() => null),
          getRandomArticles(8).catch(() => []),
        ]);
        
        if (trending.length > 0) setTrendingArticles(trending);
        if (featured) setFeaturedArticle(featured);
        if (random.length > 0) setRandomArticles(random);
        else setRandomArticles(fallbackTopics);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCardClick = (title: string) => {
    navigate(`/article/${encodeURIComponent(title)}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        {randomArticles.length > 0 && (
          <FloatingCards articles={randomArticles} onCardClick={handleCardClick} />
        )}
      </Suspense>

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header />
      <NotePanel />

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Explore the Universe of Knowledge</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">Welcome to </span>
            <span className="gradient-text text-glow">Nexus</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A futuristic knowledge platform that transforms how you explore, learn, and take notes.
            Dive into millions of articles with an immersive 3D experience.
          </p>

          <SearchBar />
        </motion.section>

        {/* Featured Article */}
        {featuredArticle && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Featured Today</h2>
            </div>

            <motion.article
              whileHover={{ scale: 1.01 }}
              onClick={() => handleCardClick(featuredArticle.title)}
              className="glass-card rounded-3xl overflow-hidden cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row">
                {featuredArticle.thumbnail && (
                  <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                    <img
                      src={featuredArticle.thumbnail.source}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="flex-1 p-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium mb-4">
                    Article of the Day
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed line-clamp-4">
                    {featuredArticle.extract}
                  </p>
                </div>
              </div>
            </motion.article>
          </motion.section>
        )}

        {/* Trending Articles */}
        {trendingArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Trending Now</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingArticles.slice(0, 8).map((article, index) => (
                <TopicCard
                  key={article.pageid}
                  article={article}
                  index={index}
                  size={index === 0 || index === 3 ? 'lg' : 'md'}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick Discover - Shows while loading or as fallback */}
        {(isLoading || trendingArticles.length === 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Quick Discover</h2>
              {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-2" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fallbackTopics.map((topic, index) => (
                <motion.button
                  key={topic.pageid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleCardClick(topic.title)}
                  className="glass-card rounded-2xl p-6 text-left hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-primary/80 font-medium">{topic.description}</span>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mt-1">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {topic.extract}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 ml-4">
                      <span className="text-lg font-bold text-white">{topic.title[0]}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Continue Reading</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentArticles.slice(0, 6).map((article, index) => (
                <TopicCard
                  key={article.pageid}
                  article={{
                    pageid: article.pageid,
                    title: article.title,
                    extract: article.extract,
                    thumbnail: article.thumbnail ? { source: article.thumbnail, width: 300, height: 200 } : undefined,
                  }}
                  index={index}
                  size="sm"
                />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
