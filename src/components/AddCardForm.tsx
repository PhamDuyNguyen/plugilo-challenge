import { useState } from 'react';
import { X } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import type { Theme } from '../types';

interface AddCardFormProps {
  onClose: () => void;
  theme: Theme;
}

export default function AddCardForm({ onClose, theme }: AddCardFormProps) {
  const { stacks, createCard } = useWishlistStore();
  const [cover, setCover] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stackId, setStackId] = useState(stacks[0]?.id || '');

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover || !name || !stackId) {
      alert('Please fill in all required fields');
      return;
    }

    await createCard(cover, name, description || undefined, stackId);
    onClose();
  };

  return (
    <div className="h-full max-h-[80vh] flex flex-col overflow-hidden">
      <div className={`px-6 py-4 border-b flex-shrink-0 ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create / Edit Card
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Cover <span className="text-red-500">*</span>
          </label>
          <div className={`w-full h-48 rounded-lg border-2 border-dashed overflow-hidden ${
            isDark ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-gray-300 bg-gray-50'
          }`}>
            {cover ? (
              <img src={cover} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No cover image
                </span>
              </div>
            )}
          </div>
          <input
            type="url"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            className={`mt-2 w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="Cover image URL"
            required
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
            placeholder="Card name"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-black/20 resize-none`}
            placeholder="Description"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Selected Stack <span className="text-red-500">*</span>
          </label>
          <select
            value={stackId}
            onChange={(e) => setStackId(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-black/20`}
            required
          >
            {stacks.length === 0 ? (
              <option value="">No stacks available</option>
            ) : (
              stacks.map((stack) => (
                <option key={stack.id} value={stack.id}>
                  {stack.name}
                </option>
              ))
            )}
          </select>
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

