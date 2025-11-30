import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Theme } from '../types';
import AddCardForm from './AddCardForm';
import CreateStackForm from './CreateStackForm';

interface CreatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  anchorPosition?: { top: number; left: number; right: number; bottom: number } | null;
}

export default function CreatePopup({ isOpen, onClose, theme, anchorPosition }: CreatePopupProps) {
  const [view, setView] = useState<'menu' | 'card' | 'stack'>('menu');
  const isDark = theme === 'dark';
  
  // Calculate position relative to anchor button
  const getPopupStyle = () => {
    if (anchorPosition) {
      return {
        position: 'fixed' as const,
        bottom: `${window.innerHeight - anchorPosition.top + 8}px`,
        right: `${window.innerWidth - anchorPosition.right}px`,
      };
    }
    return {
      position: 'fixed' as const,
      bottom: '96px',
      right: '24px',
    };
  };

  const handleCardClick = () => {
    setView('card');
  };

  const handleStackClick = () => {
    setView('stack');
  };

  const handleClose = () => {
    setView('menu');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`z-50 rounded-xl sm:rounded-2xl shadow-2xl ${
              isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
            } overflow-hidden w-[calc(100vw-1rem)] sm:w-auto max-w-sm sm:max-w-none`}
            style={{ 
              minWidth: '200px',
              ...getPopupStyle()
            }}
          >
            {view === 'menu' ? (
              <>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Create
                    </h3>
                    <button
                      onClick={handleClose}
                      className={`p-1 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-[#2a2a2a] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleCardClick}
                    className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                      isDark
                        ? 'hover:bg-[#2a2a2a] text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    onClick={handleStackClick}
                    className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                      isDark
                        ? 'hover:bg-[#2a2a2a] text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    Stack
                  </button>
                </div>
              </>
            ) : view === 'card' ? (
              <div className="w-full sm:w-[500px] max-w-[calc(100vw-2rem)] sm:max-w-none max-h-[80vh] flex flex-col">
                <AddCardForm onClose={handleClose} theme={theme} />
              </div>
            ) : (
              <div className="w-full sm:w-[400px] max-w-[calc(100vw-2rem)] sm:max-w-none max-h-[80vh] flex flex-col">
                <CreateStackForm onClose={handleClose} theme={theme} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


