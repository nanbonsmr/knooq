import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80',
  };

  const handleClick = () => {
    navigate(`/article/${encodeURIComponent(article.title)}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={handleClick}
      className={`glass-card rounded-2xl overflow-hidden cursor-pointer group ${sizeClasses[size]}`}
    >
      <div className="relative w-full h-full">
        {article.thumbnail ? (
          <img
            src={article.thumbnail.source}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary opacity-60" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              {article.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {article.description}
                </p>
              )}
              {article.extract && (
                <p className="text-sm text-muted-foreground/80 mt-2 line-clamp-2">
                  {article.extract}
                </p>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        </div>
      </div>
    </motion.article>
  );
}
