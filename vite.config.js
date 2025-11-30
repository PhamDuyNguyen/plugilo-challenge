import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Development mode - serve main.tsx
  if (command === 'serve') {
    return {
      plugins: [react()],
      server: {
        port: 5173,
        open: true,
      },
    };
  }

  // Build mode - build widget library
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: './src/widget.tsx',
        name: 'WishlistWidget',
        fileName: 'wishlist-widget',
        formats: ['es', 'umd'],
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      cssCodeSplit: false,
    },
  };
});

