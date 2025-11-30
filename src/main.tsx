import React from 'react';
import ReactDOM from 'react-dom/client';
import Dock from './components/Dock';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Wishlist Widget Demo</h1>
        <p className="text-gray-600 mb-8">
          This is a demo page. The widget appears as a floating button in the bottom right corner.
        </p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">How to Embed</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`<!-- Add this to your HTML -->
<wishlist-dock data-theme="light"></wishlist-dock>

<!-- Or dark theme -->
<wishlist-dock data-theme="dark"></wishlist-dock>`}</code>
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Create and manage stacks (collections)</li>
            <li>Add cards with cover images, names, and descriptions</li>
            <li>Swipe through cards in Tinder-like interface</li>
            <li>Optimistic UI updates with background sync</li>
            <li>Responsive design for mobile and desktop</li>
            <li>Theme support (light/dark)</li>
          </ul>
        </div>
      </div>
    </div>
    <Dock theme="light" />
  </React.StrictMode>,
);

