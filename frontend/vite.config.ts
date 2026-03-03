import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            // Proxy short URLs to the backend (for local dev)
            // This regex matches any path that does NOT start with /api or /assets
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
