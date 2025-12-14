import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          setScale((s) => Math.min(s + 0.25, 3));
          break;
        case '-':
          setScale((s) => Math.max(s - 0.25, 0.5));
          break;
        case 'r':
          setRotation((r) => r + 90);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => r + 90);
  
  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
          />

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 sm:gap-2 glass rounded-xl sm:rounded-2xl p-1.5 sm:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="rounded-lg sm:rounded-xl w-8 h-8 sm:w-10 sm:h-10"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground min-w-[3rem] sm:min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="rounded-lg sm:rounded-xl w-8 h-8 sm:w-10 sm:h-10"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="rounded-lg sm:rounded-xl w-8 h-8 sm:w-10 sm:h-10"
              title="Rotate (R)"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="rounded-lg sm:rounded-xl w-8 h-8 sm:w-10 sm:h-10 hidden sm:flex"
              title="Download"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-lg sm:rounded-xl w-8 h-8 sm:w-10 sm:h-10"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative max-w-[90vw] max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          </motion.div>

          {/* Caption */}
          {alt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-10 glass rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:max-w-lg text-center"
            >
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{alt}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
