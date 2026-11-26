import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    // Original-Code nutzt CRA-Variable process.env.REACT_APP_BACKEND_URL
    define: {
      'process.env.REACT_APP_BACKEND_URL': JSON.stringify(env.REACT_APP_BACKEND_URL || ''),
    },
    server: {
      port: 3000,
      // Im Entwicklungsmodus /api an das Backend weiterreichen
      proxy: { '/api': 'http://127.0.0.1:' + (env.BACKEND_PORT || 8001) },
    },
  };
});
