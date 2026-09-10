import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const directories = id.split('node_modules/');
            const packageName = directories[directories.length - 1].split('/')[0];
            
            // Group smaller packages together to avoid too many tiny chunks
            if (packageName === 'react' || packageName === 'react-dom' || packageName === 'react-router-dom') {
              return 'vendor-react';
            }
            if (packageName === 'lucide-react') {
              return 'vendor-icons';
            }
            if (packageName === 'recharts') {
              return 'vendor-charts';
            }
            if (packageName === 'jspdf' || packageName === 'jspdf-autotable') {
              return 'vendor-pdf';
            }
            
            // Put everything else in small individual chunks
            return `vendor-${packageName}`;
          }
        }
      }
    }
  }
});
