import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WikiSearchResult } from '@/lib/wikipedia';

interface TopicCardProps {
  article: WikiSearchResult;
  index: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function TopicCard({ article, index, size = 'md' }: TopicCardProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'h-44 sm:h-52',
    md: 'h-52 sm:h-64',
    lg: 'h-64 sm:h-80 md:col-span-2 lg:col-span-1',
  };

  const handleClick = () => {
    navigate(`/article/${encodeURIComponent(article.title)}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      onClick={handleClick}
      className={`relative glass-card rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group ${sizeClasses[size]}`}
    >
      <div className="relative w-full h-full">
        {article.thumbnail ? (
          <img
            src={article.thumbnail.source}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-foreground/20" />
          </div>
        )}
        
        {/* Multi-layer overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500" />
        
        {/* Content */}
        <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Category badge */}
              {article.description && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-medium mb-2 backdrop-blur-sm">
                  {article.description}
                </span>
              )}
              
              <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                {article.title}
              </h3>
              
              {article.extract && size !== 'sm' && (
                <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
                  {article.extract}
                </p>
              )}
            </div>
            
            {/* Arrow button */}
            <motion.div
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 border border-primary/30"
            >
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-primary/40" />
          <div className="absolute -inset-px rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-sm" />
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ x: '-100%', y: '-100%' }}
            whileHover={{ x: '100%', y: '100%' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform -skew-x-12"
          />
        </div>
      </div>
    </motion.article>
  );
}
