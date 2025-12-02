import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel veya Node ortamındaki env değişkenlerini güvenli bir şekilde frontend'e gömüyoruz
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.ADMIN_KEY': JSON.stringify(process.env.ADMIN_KEY),
    // Diğer process.env çağrıları için boş obje (hatayı önler)
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
