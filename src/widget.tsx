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
    // Check if styles are already injected
    if (document.getElementById('wishlist-widget-styles')) {
      return;
    }

    // For development, styles are imported via CSS
    // For production build, styles would be inlined here
    const styleId = 'wishlist-widget-styles';
    const existingStyle = document.getElementById(styleId);
    if (!existingStyle) {
      const link = document.createElement('link');
      link.id = styleId;
      link.rel = 'stylesheet';
      link.href = '/src/index.css';
      document.head.appendChild(link);
    }
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

