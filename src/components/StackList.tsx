import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Theme } from '../types';

interface StackListProps {
  onStackClick: (stackId: string) => void;
  theme: Theme;
}

export default function StackList({ onStackClick, theme }: StackListProps) {
  const { stacks, loadStacks, deleteStack, getStackCardCount, isLoading } = useWishlistStore();

  useEffect(() => {
    loadStacks();
  }, [loadStacks]);

  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (stacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
          No stacks yet. Create your first stack!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-5">
      <div className="grid grid-cols-2 gap-4">
        {stacks.map((stack, index) => {
          const cardCount = getStackCardCount(stack.id);
          return (
            <motion.div
              key={stack.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.04, type: 'spring', stiffness: 300 }}
              onClick={() => onStackClick(stack.id)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                isDark 
                  ? 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1f1f1f]' 
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              } hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Cover */}
              <div
                className="h-36 w-full relative overflow-hidden"
                style={{
                  background: stack.cover && typeof stack.cover === 'string' && stack.cover.startsWith('linear-gradient')
                    ? stack.cover
                    : stack.cover && typeof stack.cover === 'string'
                    ? `url(${stack.cover}) center/cover`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content */}
              <div className={`p-4 ${isDark ? 'bg-[#1f1f1f]' : 'bg-white'}`}>
                <h3 className={`font-bold text-sm mb-1.5 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stack.name}
                </h3>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this stack?')) {
                    deleteStack(stack.id);
                  }
                }}
                className={`absolute top-3 right-3 p-2 rounded-xl bg-red-500/90 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg`}
                aria-label="Delete stack"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

