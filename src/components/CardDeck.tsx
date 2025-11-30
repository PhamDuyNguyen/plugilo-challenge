import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Trash2, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Theme } from '../types';

interface CardDeckProps {
  stackId: string;
  theme: Theme;
  onStackChange: (stackId: string) => void;
}

export default function CardDeck({ stackId, theme }: CardDeckProps) {
  const { getCardsByStack, deleteCard, stacks, copyCard, loadCards } = useWishlistStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [dragIntent, setDragIntent] = useState<'horizontal' | 'vertical' | null>(null);
  const [copyingToStack, setCopyingToStack] = useState<string | null>(null);
  
  const cards = getCardsByStack(stackId);
  const currentCard = cards[currentIndex];

  // Reload cards when stack changes
  useEffect(() => {
    if (stackId) {
      loadCards(stackId);
    }
  }, [stackId, loadCards]);

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
      if (currentIndex >= cards.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const absX = Math.abs(info.delta.x);
    const absY = Math.abs(info.delta.y);
    
    // Determine drag direction if not set yet
    if (!dragIntent && (absX > 10 || absY > 10)) {
      if (absX > absY) {
        setDragIntent('horizontal');
      } else {
        setDragIntent('vertical');
      }
    }
    
    setIsSwiping(true);
    
    // Update swipe delta for visual feedback
    if (dragIntent === 'horizontal' || absX > absY) {
      setSwipeDelta({ x: info.offset.x, y: 0 });
    } else {
      setSwipeDelta({ x: 0, y: info.offset.y });
    }
    
    // Check if swiping down over a stack for add/copy feedback
    if (dragIntent === 'vertical' && info.offset.y > 0) {
      // Get actual pointer coordinates from the event
      let clientX = 0;
      let clientY = 0;
      
      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else if (event instanceof TouchEvent && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if (event instanceof PointerEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      }
      
      if (clientX > 0 && clientY > 0) {
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const stackElement = elementBelow?.closest('[data-stack-id]');
        
        if (stackElement) {
          const targetStackId = stackElement.getAttribute('data-stack-id');
          if (targetStackId && targetStackId !== stackId) {
            if (!copyingToStack) {
              setCopyingToStack(targetStackId);
            }
          }
        } else if (copyingToStack) {
          setCopyingToStack(null);
        }
      }
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const absX = Math.abs(info.delta.x);
    const absY = Math.abs(info.delta.y);
    
    const cardId = cards[currentIndex]?.id;
    if (!cardId) {
      setSwipeDelta({ x: 0, y: 0 });
      setDragIntent(null);
      return;
    }
    
    const threshold = 50; // Minimum distance to trigger action
    const velocityThreshold = 500; // Minimum velocity to trigger action
    
    // Handle horizontal swipes (left/right) - navigate between cards
    if (dragIntent === 'horizontal' || absX > absY) {
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
      
      setSwipeDelta({ x: 0, y: 0 });
      setDragIntent(null);
      setIsSwiping(false);
      return;
    }
    
    // Handle vertical swipes (up/down) - delete/add
    if (dragIntent === 'vertical' || absY > absX) {
      const hasDistance = Math.abs(info.offset.y) > threshold;
      const hasVelocity = Math.abs(info.velocity.y) > velocityThreshold;
      
      if (hasDistance || hasVelocity) {
        if (info.offset.y < 0) {
          // Swiped up - delete card
          if (confirm('Delete this card?')) {
            deleteCard(cardId);
          }
        } else if (info.offset.y > 0) {
          // Swiped down - check if over a stack to copy
          // Get actual pointer coordinates from the event
          let clientX = 0;
          let clientY = 0;
          
          if (event instanceof MouseEvent) {
            clientX = event.clientX;
            clientY = event.clientY;
          } else if (event instanceof TouchEvent && event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
          } else if (event instanceof PointerEvent) {
            clientX = event.clientX;
            clientY = event.clientY;
          }
          
          // Also try using info.point as fallback
          if (clientX === 0 && clientY === 0 && info.point) {
            clientX = info.point.x;
            clientY = info.point.y;
          }
          
          if (clientX > 0 && clientY > 0) {
            const elementBelow = document.elementFromPoint(clientX, clientY);
            const stackElement = elementBelow?.closest('[data-stack-id]');
            
            if (stackElement) {
              const targetStackId = stackElement.getAttribute('data-stack-id');
              if (targetStackId && targetStackId !== stackId) {
                // Copy card to the new stack
                setCopyingToStack(targetStackId);
                // Reset card position immediately before copying
                setSwipeDelta({ x: 0, y: 0 });
                setDragIntent(null);
                setIsSwiping(false);
                await copyCard(cardId, targetStackId);
                setTimeout(() => {
                  setCopyingToStack(null);
                }, 1000);
                return; // Early return to prevent further state updates
              } else {
                setCopyingToStack(null);
              }
            } else {
              // If we were showing copy feedback but not over a stack anymore, use the last known stack
              if (copyingToStack) {
                // Reset card position immediately before copying
                setSwipeDelta({ x: 0, y: 0 });
                setDragIntent(null);
                setIsSwiping(false);
                await copyCard(cardId, copyingToStack);
                setTimeout(() => {
                  setCopyingToStack(null);
                }, 1000);
                return; // Early return to prevent further state updates
              } else {
                setCopyingToStack(null);
              }
            }
          } else if (copyingToStack) {
            // Use the stack we were hovering over during drag
            // Reset card position immediately before copying
            setSwipeDelta({ x: 0, y: 0 });
            setDragIntent(null);
            setIsSwiping(false);
            await copyCard(cardId, copyingToStack);
            setTimeout(() => {
              setCopyingToStack(null);
            }, 1000);
            return; // Early return to prevent further state updates
          }
        }
      }
      
      // Always reset drag intent and swipe delta at the end
      setSwipeDelta({ x: 0, y: 0 });
      setDragIntent(null);
      setIsSwiping(false);
    }
  };

  // Reset index when stack changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [stackId]);

  // Adjust index when cards change
  useEffect(() => {
    if (cards.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= cards.length) {
      setCurrentIndex(Math.max(0, cards.length - 1));
    }
  }, [cards.length, currentIndex]);

  if (cards.length === 0) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No cards in this stack yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} pb-safe z-40`}>
      {/* Delete Area (Top) - Show when swiping up */}
      <div 
        className={`absolute top-0 left-0 right-0 h-16 sm:h-20 flex items-center justify-center z-10 transition-all ${
          isSwiping && dragIntent === 'vertical' && swipeDelta.y < 0 ? 'bg-red-500/10' : ''
        }`}
      >
        {isSwiping && dragIntent === 'vertical' && swipeDelta.y < 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Swipe up to delete</span>
          </motion.div>
        )}
      </div>

      {/* Copy Feedback Notification */}
      <AnimatePresence>
        {copyingToStack && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`px-4 sm:px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
              isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
            }`}>
              <Copy className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Copying to <span className="font-semibold">{stacks.find(s => s.id === copyingToStack)?.name || 'stack'}</span>...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Deck - Swipeable Area */}
      <div 
        className="h-full flex items-center justify-center p-3 sm:p-4 md:p-8" 
        style={{ 
          touchAction: 'pan-x pan-y pinch-zoom',
          paddingBottom: 'max(5rem, env(safe-area-inset-bottom, 0px) + 5rem)'
        }}
      >
        <div className="relative w-full max-w-[230px] sm:max-w-[269px] px-2 sm:px-0" style={{ minHeight: '240px', height: 'calc((100vh - 200px) * 0.6)', maxHeight: 'calc((100vh - 200px) * 0.6)' }}>
          {/* Render 3 cards in a stack */}
          {cards.length > 0 && cards.slice(Math.max(0, currentIndex - 1), currentIndex + 2).map((card, idx) => {
            const cardIndex = Math.max(0, currentIndex - 1) + idx;
            const isCurrent = cardIndex === currentIndex;
            const offset = cardIndex - currentIndex;
            const zIndex = 10 - Math.abs(offset);
            const scale = 1 - Math.abs(offset) * 0.1;
            const yOffset = Math.abs(offset) * 20;

            return (
              <motion.div
                key={card.id}
                drag={isCurrent && !copyingToStack}
                dragConstraints={false}
                dragElastic={0.2}
                dragMomentum={false}
                onDragStart={() => {
                  // Reset drag intent when drag starts
                  setDragIntent(null);
                }}
                onDrag={isCurrent ? handleDrag : undefined}
                onDragEnd={(event, info) => {
                  if (isCurrent) {
                    handleDragEnd(event, info);
                  }
                }}
                initial={false}
                animate={{
                  x: isCurrent && isSwiping && dragIntent === 'horizontal' 
                    ? swipeDelta.x + offset * 20 
                    : offset * 20,
                  y: isCurrent && isSwiping && dragIntent === 'vertical' 
                    ? swipeDelta.y + yOffset 
                    : yOffset,
                  scale,
                  rotateY: isCurrent && isSwiping && dragIntent === 'horizontal' 
                    ? (swipeDelta.x / 20) * 5 + offset * 5 
                    : offset * 5,
                }}
                transition={{
                  type: 'spring',
                  stiffness: isSwiping ? 400 : 500,
                  damping: isSwiping ? 30 : 35,
                  mass: 0.3,
                  duration: 0.2,
                }}
                className={`absolute w-full rounded-2xl overflow-hidden shadow-2xl border-2 cursor-grab active:cursor-grabbing ${
                  isDark 
                    ? 'bg-[#1a1a1a] border-[#2a2a2a]' 
                    : 'bg-white border-gray-200'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  height: '100%',
                  top: 0,
                  left: 0,
                  zIndex,
                }}
              >
                {/* Card Cover */}
                <div className="relative h-[55%] sm:h-[60%] w-full bg-gray-100">
                  <img
                    src={card.cover}
                    alt={card.name}
                    draggable="false"
                    className="w-full h-full object-cover pointer-events-none select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>

                {/* Card Content */}
                <div className={`p-3 sm:p-4 md:p-6 flex-1 flex flex-col select-none ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                  <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {card.name}
                  </h3>
                  {card.description && (
                    <p className={`text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {card.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {/* Navigation Controls */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-30">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md transition-all touch-manipulation ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
                  : isDark
                  ? 'bg-white hover:bg-gray-50 active:bg-gray-50 text-gray-900 border border-gray-200'
                  : 'bg-white hover:bg-gray-50 active:bg-gray-50 text-gray-900 border border-gray-200'
              } shadow-sm`}
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            <div className={`px-2 py-1 flex items-center justify-center rounded-md flex-shrink-0 ${isDark ? 'bg-white text-gray-900 border border-gray-200' : 'bg-white text-gray-900 border border-gray-200'} shadow-sm`}>
              <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md transition-all touch-manipulation ${
                currentIndex === cards.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
                  : isDark
                  ? 'bg-white hover:bg-gray-50 active:bg-gray-50 text-gray-900 border border-gray-200'
                  : 'bg-white hover:bg-gray-50 active:bg-gray-50 text-gray-900 border border-gray-200'
              } shadow-sm`}
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

