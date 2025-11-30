import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Search, Star, X, Minimize2, Maximize2, MoreVertical } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import CardDeck from './CardDeck';
import CreatePopup from './CreatePopup';
import StackOptionsPopup from './StackOptionsPopup';
import type { Theme } from '../types';

interface DockProps {
  theme?: Theme;
}

export default function Dock({ theme = 'light' }: DockProps) {
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showStackOptions, setShowStackOptions] = useState<string | null>(null);
  const [stackScrollIndex, setStackScrollIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredStackId, setHoveredStackId] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [createButtonPosition, setCreateButtonPosition] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null);
  const [stackButtonPositions, setStackButtonPositions] = useState<Map<string, { top: number; left: number; right: number; bottom: number }>>(new Map());
  const [dragOverStackId, setDragOverStackId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const { stacks, loadStacks, loadCards, searchQuery, setSearchQuery, getFilteredStacks, copyCard } = useWishlistStore();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadStacks();
    loadCards();
  }, [loadStacks, loadCards]);

  useEffect(() => {
    const filtered = getFilteredStacks();
    if (filtered.length > 0 && !selectedStackId) {
      setSelectedStackId(filtered[0].id);
    }
  }, [stacks, selectedStackId, getFilteredStacks]);

  const isDark = theme === 'dark';
  const filteredStacks = getFilteredStacks();
  // Show fewer stacks on mobile, more on desktop
  const stacksToShow = isMobile ? 3 : 5;

  const handleStackClick = (stackId: string) => {
    setSelectedStackId(stackId);
    setShowStackOptions(null);
  };

  const handleStackOptionsClick = (stackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Get stack button position (the parent button, not the options button)
    const stackButton = (e.currentTarget as HTMLElement).closest('[data-stack-id]') as HTMLElement;
    if (stackButton) {
      const rect = stackButton.getBoundingClientRect();
      setStackButtonPositions(new Map([[stackId, {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      }]]));
    }
    setShowStackOptions(stackId);
  };

  // Update stack button positions when scrolling or resizing
  useEffect(() => {
    if (showStackOptions) {
      const updatePosition = () => {
        const stackButton = document.querySelector(`[data-stack-id="${showStackOptions}"]`) as HTMLElement;
        if (stackButton) {
          const rect = stackButton.getBoundingClientRect();
          setStackButtonPositions(new Map([[showStackOptions, {
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
          }]]));
        }
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showStackOptions, stackScrollIndex, filteredStacks]);

  const handleLongPressStart = (stackId: string) => {
    const timer = setTimeout(() => {
      // Get stack button position
      const stackButton = document.querySelector(`[data-stack-id="${stackId}"]`) as HTMLElement;
      if (stackButton) {
        const rect = stackButton.getBoundingClientRect();
        setStackButtonPositions(new Map([[stackId, {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        }]]));
      }
      setShowStackOptions(stackId);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleScrollLeft = () => {
    if (stackScrollIndex > 0) {
      const newIndex = stackScrollIndex - 1;
      setStackScrollIndex(newIndex);
      
      // Smooth scroll to the new position
      if (scrollContainerRef.current) {
        const stackWidth = isMobile ? 48 + 6 : 56 + 8; // w-12 (48px) + gap-1.5 (6px) or w-14 (56px) + gap-2 (8px)
        const scrollAmount = stackWidth;
        scrollContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleScrollRight = () => {
    if (stackScrollIndex < filteredStacks.length - stacksToShow) {
      const newIndex = stackScrollIndex + 1;
      setStackScrollIndex(newIndex);
      
      // Smooth scroll to the new position
      if (scrollContainerRef.current) {
        const stackWidth = isMobile ? 48 + 6 : 56 + 8; // w-12 (48px) + gap-1.5 (6px) or w-14 (56px) + gap-2 (8px)
        const scrollAmount = stackWidth;
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setStackScrollIndex(0); // Reset scroll when filtering
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchBar(false);
  };

  const handleCreateClick = () => {
    if (createButtonRef.current) {
      const rect = createButtonRef.current.getBoundingClientRect();
      setCreateButtonPosition({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      });
    }
    setShowCreatePopup(true);
  };

  // Update position when dock moves
  useEffect(() => {
    if (showCreatePopup && createButtonRef.current) {
      const updatePosition = () => {
        const rect = createButtonRef.current?.getBoundingClientRect();
        if (rect) {
          setCreateButtonPosition({
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showCreatePopup]);

  // Minimized state - Small button only
  if (isMinimized) {
    return (
      <>
        {/* Card Deck - Main View */}
        {selectedStackId && (
          <CardDeck 
            stackId={selectedStackId} 
            theme={theme}
            onStackChange={setSelectedStackId}
          />
        )}

        {/* Minimized Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={() => setIsMinimized(false)}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all ${
            isDark 
              ? 'bg-[#1a1a1a] border-2 border-[#2a2a2a] hover:bg-[#2a2a2a] text-gray-300' 
              : 'bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
          aria-label="Expand plugilo"
        >
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">plugilo</span>
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        </motion.button>
      </>
    );
  }

  return (
    <>
      {/* Card Deck - Main View */}
      {selectedStackId && (
        <CardDeck 
          stackId={selectedStackId} 
          theme={theme}
          onStackChange={setSelectedStackId}
        />
      )}

      {/* Horizontal Dock at Bottom - Floating */}
      <motion.div
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed bottom-2 sm:bottom-4 left-1/2 z-50 w-[calc(100vw-0.5rem)] sm:w-auto sm:max-w-[600px] ${
          isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
        } shadow-2xl rounded-2xl`}
        style={{ 
          bottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px) + 0.5rem)',
          transform: 'translateX(-50%)'
        }}
      >
        <div className="px-3 sm:px-4 py-2 sm:py-2.5">
          {/* Search Bar (Inside Dock) */}
          <AnimatePresence>
            {showSearchBar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 sm:mb-3 overflow-hidden"
              >
                <div className={`flex items-center gap-2 px-3 sm:px-2 py-1 rounded-lg ${
                  isDark ? 'bg-[#2a2a2a] border border-[#3a3a3a]' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Filter stacks..."
                    className={`flex-1 bg-transparent outline-none text-sm ${
                      isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                    }`}
                    autoFocus
                  />
                  <button
                    onClick={handleClearSearch}
                    className={`p-1 rounded transition-colors flex-shrink-0 touch-manipulation ${
                      isDark 
                        ? 'hover:bg-[#3a3a3a] active:bg-[#3a3a3a] text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-200 active:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 overflow-x-visible">

            {/* Plugilo Label */}
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">plugilo</span>
            </div>

            {/* Left Arrow */}
            <button
              onClick={handleScrollLeft}
              disabled={stackScrollIndex === 0}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
                stackScrollIndex === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : isDark
                  ? 'hover:bg-[#2a2a2a] active:bg-[#2a2a2a] text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 active:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Stack Representations */}
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-1.5 sm:gap-2 p-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide"
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {filteredStacks.length === 0 ? (
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} px-4 whitespace-nowrap`}>
                  No stacks found
                </div>
              ) : (
                filteredStacks.map((stack) => {
                  const isActive = stack.id === selectedStackId;
                  const isHovered = hoveredStackId === stack.id;
                  return (
                    <div
                      key={stack.id}
                      className="relative flex-shrink-0"
                      onMouseEnter={() => setHoveredStackId(stack.id)}
                      onMouseLeave={() => setHoveredStackId(null)}
                      onTouchStart={() => handleLongPressStart(stack.id)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                        if (stack.id !== selectedStackId) {
                          setDragOverStackId(stack.id);
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverStackId(null);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDragOverStackId(null);
                        
                        // Get card ID from dataTransfer
                        const cardId = e.dataTransfer.getData('application/card-id') || e.dataTransfer.getData('text/plain');
                        if (cardId && stack.id !== selectedStackId) {
                          // Copy card to the target stack
                          await copyCard(cardId, stack.id);
                        }
                      }}
                    >
                      <motion.button
                        data-stack-id={stack.id}
                        layout="position"
                        onClick={() => handleStackClick(stack.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setStackButtonPositions(new Map([[stack.id, {
                            top: rect.top,
                            left: rect.left,
                            right: rect.right,
                            bottom: rect.bottom,
                          }]]));
                          setShowStackOptions(stack.id);
                        }}
                        className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all touch-manipulation ${
                          dragOverStackId === stack.id
                            ? 'border-blue-500 shadow-lg scale-110 z-10 ring-2 ring-blue-500/50'
                            : isActive
                            ? 'border-blue-500 shadow-lg scale-105 z-10'
                            : isDark
                            ? 'border-[#2a2a2a] hover:border-[#3a3a3a] active:border-[#3a3a3a]'
                            : 'border-gray-200 hover:border-gray-300 active:border-gray-300'
                        }`}
                        style={{
                          boxShadow: isActive 
                            ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                            : 'none'
                        }}
                        whileHover={{ scale: !isMobile ? 1.05 : 1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                      >
                        {/* Stack Cover */}
                        <div
                          className="w-full h-full bg-gray-100"
                          style={{
                            background: stack.cover && typeof stack.cover === 'string' && stack.cover.startsWith('linear-gradient')
                              ? stack.cover
                              : stack.cover && typeof stack.cover === 'string' && (stack.cover.startsWith('http') || stack.cover.startsWith('/'))
                              ? `url(${stack.cover}) center/cover`
                              : stack.cover || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        />
                        {/* Active Indicator - Overlay that doesn't hide border */}
                        {isActive && (
                          <div className="absolute inset-0 bg-blue-500/20 pointer-events-none rounded-lg sm:rounded-xl" />
                        )}
                        {/* Stack Label */}
                        <div className={`absolute bottom-0 left-0 right-0 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] font-medium truncate backdrop-blur-sm ${
                          isDark ? 'bg-black/70 text-white' : 'bg-white/90 text-gray-900'
                        }`}>
                          {stack.name}
                        </div>
                      </motion.button>
                      {/* Options Button - Visible on hover or always on mobile */}
                      <motion.button
                        className={`stack-options-btn absolute top-0 right-0 p-0.5 sm:p-1 rounded-bl-lg sm:rounded-bl-xl rounded-tr-lg sm:rounded-tr-xl transition-all z-20 ${
                          isDark 
                            ? 'bg-black/80 hover:bg-black/90 text-gray-300 hover:text-white' 
                            : 'bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900'
                        } ${isHovered || isMobile ? 'opacity-100' : 'opacity-0'}`}
                        onClick={(e) => handleStackOptionsClick(stack.id, e)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Stack options"
                      >
                        <MoreVertical className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </motion.button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleScrollRight}
              disabled={stackScrollIndex >= filteredStacks.length - stacksToShow}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
                stackScrollIndex >= filteredStacks.length - stacksToShow
                  ? 'opacity-30 cursor-not-allowed'
                  : isDark
                  ? 'hover:bg-[#2a2a2a] active:bg-[#2a2a2a] text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 active:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Add New Button */}
            <button
              ref={createButtonRef}
              onClick={handleCreateClick}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
                isDark
                  ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] active:bg-[#3a3a3a] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-200 text-gray-900'
              }`}
              aria-label="Add new"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Search Icon */}
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
                showSearchBar
                  ? isDark
                    ? 'bg-[#2a2a2a] text-white'
                    : 'bg-gray-100 text-gray-900'
                  : isDark 
                  ? 'hover:bg-[#2a2a2a] active:bg-[#2a2a2a] text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 active:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Minimize Icon */}
            <button
              onClick={() => setIsMinimized(true)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
                isDark 
                  ? 'hover:bg-[#2a2a2a] active:bg-[#2a2a2a] text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 active:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Popup */}
      <CreatePopup
        isOpen={showCreatePopup}
        onClose={() => {
          setShowCreatePopup(false);
          setCreateButtonPosition(null);
        }}
        theme={theme}
        anchorPosition={createButtonPosition}
      />

      {/* Stack Options Popup */}
      {showStackOptions && (
        <StackOptionsPopup
          stackId={showStackOptions}
          onClose={() => {
            setShowStackOptions(null);
            setStackButtonPositions(new Map());
          }}
          theme={theme}
          anchorPosition={stackButtonPositions.get(showStackOptions) || null}
        />
      )}
    </>
  );
}
