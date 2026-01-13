
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensures process.env.API_KEY is available in the browser if permitted by the host environment
    // Note: For local dev, use .env files and import.meta.env, but this supports the specific existing architecture.
    'process.env': process.env
  }
});
