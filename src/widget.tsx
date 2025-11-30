import React from 'react';
import ReactDOM from 'react-dom/client';
import Dock from './components/Dock';
import './index.css';
import type { Theme } from './types';

class WishlistDock extends HTMLElement {
  private root: ReactDOM.Root | null = null;
  private container: HTMLDivElement | null = null;

  connectedCallback() {
    const theme = (this.getAttribute('data-theme') || 'light') as Theme;
    
    // Create a container with scoped class to avoid style conflicts
    this.container = document.createElement('div');
    this.container.className = 'wishlist-widget-container';
    this.appendChild(this.container);

    // Inject styles if not already present
    this.injectStyles();

    // Render React component
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <React.StrictMode>
        <Dock theme={theme} />
      </React.StrictMode>
    );
  }

  disconnectedCallback() {
    if (this.root && this.container) {
      this.root.unmount();
      this.root = null;
      this.container = null;
    }
  }

  private injectStyles() {
    // Styles should be included separately by the consuming application
    // This method is kept for potential future use but doesn't inject styles
    // to avoid path resolution issues between dev and production builds
  }

  static get observedAttributes() {
    return ['data-theme'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-theme' && oldValue !== newValue && this.root && this.container) {
      const theme = (newValue || 'light') as Theme;
      this.root.render(
        <React.StrictMode>
          <Dock theme={theme} />
        </React.StrictMode>
      );
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('wishlist-dock')) {
  customElements.define('wishlist-dock', WishlistDock);
}

// Export for direct React usage
export default Dock;

