import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Theme } from '../types';

interface SwipeModeProps {
  stackId: string;
  theme: Theme;
}

export default function SwipeMode({ stackId, theme }: SwipeModeProps) {
  const { getCardsByStack, deleteCard, stacks } = useWishlistStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const cards = getCardsByStack(stackId);
  const stack = stacks.find(s => s.id === stackId);
  const currentCard = cards[currentIndex];

  const isDark = theme === 'dark';

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev < cards.length - 1) {
        setDirection(1);
        return prev + 1;
      }
      return prev;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => {
      if (prev > 0) {
        setDirection(-1);
        return prev - 1;
      }
      return prev;
    });
  };

  const handleDelete = () => {
    if (currentCard && confirm('Delete this card?')) {
      deleteCard(currentCard.id);
      setCurrentIndex(prev => {
        if (prev >= cards.length - 1 && prev > 0) {
          return prev - 1;
        }
        return prev;
      });
    }
  };

  const handleSwipeDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only process horizontal drags (ignore vertical scrolling)
    if (Math.abs(info.delta.y) > Math.abs(info.delta.x)) {
      return; // Vertical movement, ignore
    }

    setIsSwiping(true);
    setSwipeDelta(info.offset.x);
  };

  const handleSwipeDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsSwiping(false);
    
    // Only process horizontal swipes
    if (Math.abs(info.delta.y) > Math.abs(info.delta.x)) {
      setSwipeDelta(0);
      return; // Vertical movement, ignore
    }

    const threshold = 60; // Minimum distance to trigger card change
    const velocityThreshold = 500; // Minimum velocity to trigger card change
    
    const hasDistance = Math.abs(info.offset.x) > threshold;
    const hasVelocity = Math.abs(info.velocity.x) > velocityThreshold;
    
    if (hasDistance || hasVelocity) {
      if (info.offset.x > 0) {
        // Swiped right - go to previous
        handlePrevious();
      } else {
        // Swiped left - go to next
        handleNext();
      }
    }
    
    setSwipeDelta(0);
  };

  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0) {
      setCurrentIndex(cards.length - 1);
    }
  }, [cards.length, currentIndex]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          No cards in this stack yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-6 py-5 border-b ${isDark ? 'border-[#2a2a2a] bg-[#1f1f1f]' : 'border-gray-100 bg-gray-50/50'}`}>
        <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {stack?.name}
        </h3>
        <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {currentIndex + 1} of {cards.length}
        </p>
      </div>

      {/* Card Deck - Swipeable Area */}
      <div 
        className="flex-1 flex items-center justify-center p-6 relative" 
        style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {currentCard && (
            <motion.div
              key={currentCard.id}
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDrag={handleSwipeDrag}
              onDragEnd={handleSwipeDragEnd}
              initial={{ opacity: 0, x: direction * 300, scale: 0.85, rotateY: direction * 15 }}
              animate={{ 
                opacity: isSwiping ? 0.9 : 1, 
                x: isSwiping ? swipeDelta : 0, 
                scale: isSwiping ? 0.95 : 1, 
                rotateY: isSwiping ? (swipeDelta / 20) * 15 : 0 
              }}
              exit={{ opacity: 0, x: direction * -300, scale: 0.85, rotateY: direction * -15 }}
              transition={{ 
                type: 'spring', 
                damping: isSwiping ? 25 : 35, 
                stiffness: isSwiping ? 500 : 500,
                mass: 0.3,
                duration: 0.2,
              }}
              className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 ${
                isDark 
                  ? 'bg-[#1f1f1f] border-[#2a2a2a]' 
                  : 'bg-white border-gray-100'
              }`}
              style={{
                boxShadow: isDark 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Card Cover */}
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={currentCard.cover}
                  alt={currentCard.name}
                  draggable="false"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Card Content */}
              <div className={`p-6 select-none ${isDark ? 'bg-[#1f1f1f]' : 'bg-white'}`}>
                <h4 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentCard.name}
                </h4>
                {currentCard.description && (
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentCard.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className={`px-6 py-5 border-t flex items-center justify-between gap-3 ${isDark ? 'border-[#2a2a2a] bg-[#1f1f1f]' : 'border-gray-100 bg-gray-50/50'}`}>
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-3.5 rounded-xl transition-all ${
            currentIndex === 0
              ? `opacity-40 cursor-not-allowed ${isDark ? 'bg-[#2a2a2a] text-gray-500' : 'bg-gray-100 text-gray-400'}`
              : isDark
              ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white hover:scale-105'
              : 'bg-white hover:bg-gray-100 text-gray-900 hover:scale-105 border border-gray-200'
          } shadow-sm`}
          aria-label="Previous card"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleDelete}
          className={`p-3.5 rounded-xl transition-all shadow-lg hover:scale-105 ${
            isDark
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          aria-label="Delete card"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className={`p-3.5 rounded-xl transition-all ${
            currentIndex === cards.length - 1
              ? `opacity-40 cursor-not-allowed ${isDark ? 'bg-[#2a2a2a] text-gray-500' : 'bg-gray-100 text-gray-400'}`
              : isDark
              ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white hover:scale-105'
              : 'bg-white hover:bg-gray-100 text-gray-900 hover:scale-105 border border-gray-200'
          } shadow-sm`}
          aria-label="Next card"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

