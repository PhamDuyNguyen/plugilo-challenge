# Wishlist Widget (plugilo)

A modern, embeddable wishlist widget that allows users to organize content items into collections called "stacks" and manage them through an intuitive swipe-based interface.

## 🚀 Features

- **Dock Widget**: Floating button that expands into a panel
- **Stack Management**: Create, delete, and organize collections
- **Card Management**: Add cards with cover images, names, and descriptions
- **Swipe Interface**: 
  - Swipe left/right: Navigate between cards
  - Swipe up: Delete card
  - Swipe down: Copy card to another stack
- **Optimistic UI**: Instant updates with background sync
- **Theme Support**: Light and dark themes
- **Responsive Design**: Works on mobile and desktop

## 📦 Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔌 How to Embed

### Web Component (Recommended)

```html
<!-- Include the script -->
<script type="module" src="path/to/wishlist-widget.js"></script>

<!-- Add the widget -->
<wishlist-dock data-theme="light"></wishlist-dock>
```

### React Integration

```tsx
import Dock from './components/Dock';

function App() {
  return <Dock theme="light" />;
}
```

## 🏗️ Architecture Decisions

### 1. Web Component Approach
**Why**: Provides style isolation and easy embedding without framework conflicts.
**Trade-off**: Shadow DOM makes styling more complex but ensures widget independence.

### 2. Zustand for State Management
**Why**: Lightweight (~1KB), simple API, perfect for this use case.
**Trade-off**: Less structure than Redux, but sufficient for this project's complexity.

### 3. Framer Motion for Animations
**Why**: Spring physics, great React integration, built-in gesture support.
**Trade-off**: Larger bundle than CSS animations, but better UX and easier development.

### 4. Optimistic UI Updates
**Why**: Instant feedback feels faster and provides better UX.
**Trade-off**: More complex error handling, but significantly better user experience.

### 5. Single-Page Widget Architecture
**Why**: Simpler to embed, no routing complexity, smooth transitions.
**Trade-off**: Less flexible than multi-page, but perfect for widget use case.

### 6. Mock API Layer
**Why**: Easy testing, flexible, enables rapid development.
**Trade-off**: Mock data doesn't persist, but enables fast iteration.

## ⚖️ Trade-offs Made

1. **Bundle Size vs. Features**: Included libraries despite size for better UX
2. **Shadow DOM vs. Style Conflicts**: Used Shadow DOM for robust style isolation
3. **Optimistic Updates vs. Complexity**: More complex error handling for instant feedback
4. **Single Store vs. Modularity**: One Zustand store for simplicity
5. **In-Memory State vs. Persistence**: No localStorage to keep backend as source of truth
6. **Mobile-First vs. Desktop-First**: Prioritized mobile experience

## 🔮 What I'd Improve With More Time

1. **Data Persistence**: localStorage/IndexedDB for offline support and sync queue
2. **Enhanced Gestures**: Multi-touch gestures, haptic feedback, customizable thresholds
3. **Testing**: Unit, integration, and E2E tests
4. **Enhanced Features**: Search/filter, card editing, drag & drop reordering, image upload
5. **Analytics**: Usage tracking, performance monitoring, error tracking

## 📱 Responsive Design

- **Mobile (< 640px)**: Full-width dock, touch-optimized, swipe gestures primary
- **Tablet (640px - 1024px)**: Constrained width (max 600px), hybrid interactions
- **Desktop (> 1024px)**: Centered dock, mouse-optimized, hover states

## 🔄 Data Flow

1. User Action → Component dispatches action
2. Optimistic Update → Store updates UI immediately
3. API Call → Background sync with backend
4. Success → Confirm update
5. Error → Rollback changes, show error message

## 🐛 Known Limitations

1. Mock API: Data is lost on page refresh
2. Image Validation: No validation for image URLs
3. Error Messages: Basic error handling
4. Accessibility: Not fully WCAG compliant
5. Browser Support: Modern browsers only

## 📄 License

MIT
