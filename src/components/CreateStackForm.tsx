import { useState } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Theme } from '../types';

interface CreateStackFormProps {
  onClose: () => void;
  theme: Theme;
  editStackId?: string;
  initialName?: string;
}

export default function CreateStackForm({ onClose, theme, editStackId, initialName = '' }: CreateStackFormProps) {
  const { createStack, updateStack, stacks } = useWishlistStore();
  const stack = editStackId ? stacks.find(s => s.id === editStackId) : null;
  const [name, setName] = useState(initialName);
  const [cover, setCover] = useState(stack?.cover || '');

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a stack name');
      return;
    }

    if (editStackId) {
      // Update existing stack
      await updateStack(editStackId, {
        name: name.trim(),
        cover: cover.trim() || undefined,
      });
    } else {
      // Create new stack
      await createStack(name.trim(), cover.trim() || undefined);
    }
    setName('');
    setCover('');
    onClose();
  };

  return (
    <div className="h-full max-h-[80vh] flex flex-col overflow-hidden">
      <div className={`px-6 py-4 border-b flex-shrink-0 ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {editStackId ? 'Edit Stack' : 'Create / Edit Stack'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Cover
          </label>
          <div 
            className={`w-full h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${
              isDark ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-gray-300 bg-gray-50'
            }`}
            style={{
              background: cover && typeof cover === 'string' && cover.startsWith('linear-gradient')
                ? cover
                : cover && typeof cover === 'string' && (cover.startsWith('http') || cover.startsWith('/'))
                ? `url(${cover}) center/cover`
                : cover && typeof cover === 'string'
                ? `url(${cover}) center/cover`
                : 'transparent',
            }}
          >
            {cover && typeof cover === 'string' && cover.startsWith('linear-gradient') ? (
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Gradient Preview
              </span>
            ) : cover && typeof cover === 'string' && (cover.startsWith('http') || cover.startsWith('/')) ? (
              <img 
                src={cover} 
                alt="Cover preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : cover ? (
              <img 
                src={cover} 
                alt="Cover preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Cover will be auto-generated
              </span>
            )}
          </div>
          <input
            type="text"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            className={`mt-2 w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="Cover image URL or gradient (optional)"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="Stack name"
            required
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
              isDark
                ? 'border-[#2a2a2a] hover:bg-[#2a2a2a] text-gray-300'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`flex-1 px-4 py-2 rounded-lg transition-all ${
              isDark
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

