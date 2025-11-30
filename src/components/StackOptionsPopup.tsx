import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Theme } from '../types';
import CreateStackForm from './CreateStackForm';

interface StackOptionsPopupProps {
  stackId: string;
  onClose: () => void;
  theme: Theme;
  anchorPosition?: { top: number; left: number; right: number; bottom: number } | null;
}

export default function StackOptionsPopup({ stackId, onClose, theme, anchorPosition }: StackOptionsPopupProps) {
  const { stacks, deleteStack } = useWishlistStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const stack = stacks.find(s => s.id === stackId);
  const isDark = theme === 'dark';
  const popupRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);

  // Click outside to close - handled by backdrop clicks, but keeping for edge cases
  // The backdrop divs handle the click-outside functionality
  
  // Calculate position relative to anchor button
  const getPopupStyle = () => {
    if (anchorPosition) {
      return {
        position: 'fixed' as const,
        bottom: `${window.innerHeight - anchorPosition.top + 8}px`,
        left: `${anchorPosition.left}px`,
      };
    }
    return {
      position: 'fixed' as const,
      bottom: '96px',
      left: '24px',
    };
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteStack(stackId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setShowEdit(true);
  };

  const handleClose = () => {
    setShowEdit(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (showEdit && stack) {
    return (
      <AnimatePresence>
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          <motion.div
            ref={editFormRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`z-50 rounded-xl sm:rounded-2xl shadow-2xl ${
              isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
            } w-[calc(100vw-1rem)] sm:w-auto flex flex-col`}
            style={{ 
              minWidth: '300px', 
              maxWidth: '400px',
              maxHeight: '80vh',
              ...getPopupStyle()
            }}
          >
            <CreateStackForm 
              onClose={handleClose} 
              theme={theme}
              editStackId={stackId}
              initialName={stack.name}
            />
          </motion.div>
        </>
      </AnimatePresence>
    );
  }

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <AnimatePresence>
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`z-50 rounded-xl sm:rounded-2xl shadow-2xl ${
              isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
            } overflow-hidden w-[calc(100vw-1rem)] sm:w-auto`}
            style={{ 
              minWidth: '280px', 
              maxWidth: '320px',
              ...getPopupStyle()
            }}
          >
            <div className={`px-4 py-3 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Delete Stack
                </h3>
                <button
                  onClick={cancelDelete}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-[#2a2a2a] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete "{stack?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={cancelDelete}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    isDark
                      ? 'border-[#2a2a2a] hover:bg-[#2a2a2a] text-gray-300'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    isDark
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`z-50 rounded-xl sm:rounded-2xl shadow-2xl ${
            isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
          } overflow-hidden w-[calc(100vw-1rem)] sm:w-auto`}
          style={{ 
            minWidth: '200px', 
            maxWidth: '300px',
            ...getPopupStyle()
          }}
        >
        <div className={`px-4 py-3 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Options
            </h3>
            <button
              onClick={onClose}
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
            onClick={handleEdit}
            className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
              isDark
                ? 'hover:bg-[#2a2a2a] text-white'
                : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
              isDark
                ? 'hover:bg-[#2a2a2a] text-red-400'
                : 'hover:bg-gray-100 text-red-600'
            }`}
          >
            Delete
          </button>
        </div>
      </motion.div>
      </>
    </AnimatePresence>
  );
}


