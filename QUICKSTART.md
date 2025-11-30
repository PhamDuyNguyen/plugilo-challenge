# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   
   This will start the dev server at `http://localhost:5173` with a demo page.

3. **Try the widget**
   - Click the floating bookmark button in the bottom right
   - Create a new stack
   - Add some cards to your stack
   - Click on a stack to view cards in swipe mode
   - Swipe left/right or use navigation buttons

## Building for Production

```bash
npm run build
```

This creates a library build in the `dist/` folder that can be embedded on any website.

## Testing the Widget

1. Open `demo.html` in your browser (after running `npm run dev`)
2. Or embed the widget in any HTML page:
   ```html
   <wishlist-dock data-theme="light"></wishlist-dock>
   <script type="module" src="path/to/wishlist-widget.js"></script>
   ```

## Project Structure

- `src/components/` - React components
- `src/store/` - Zustand state management
- `src/api/` - Mock API service
- `src/widget.tsx` - Web Component wrapper
- `src/main.tsx` - Development entry point

## Key Features Implemented

✅ Floating dock widget with animations  
✅ Stack creation and management  
✅ Card management with cover images  
✅ Swipe mode (Tinder-like interface)  
✅ Optimistic UI updates  
✅ Theme support (light/dark)  
✅ Responsive design  
✅ Web Component for embedding  

