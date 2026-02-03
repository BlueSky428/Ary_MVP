import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// #region agent log
const DEBUG_ENDPOINT = 'http://127.0.0.1:7247/ingest/dc048cb9-747b-4b76-a396-d8c5c8d575f4';
function debugLog(message: string, data: Record<string, unknown>) {
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'vite.config.ts',
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      hypothesisId: 'H2',
    }),
  }).catch(() => {});
}
// #endregion

export default defineConfig({
  plugins: [
    react(),
    // #region agent log
    {
      name: 'debug-server-started',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const addr = server.httpServer?.address();
          const host = typeof addr === 'object' && addr && 'address' in addr ? (addr as { address: string }).address : 'unknown';
          const port = typeof addr === 'object' && addr && 'port' in addr ? (addr as { port: number }).port : 5174;
          debugLog('Vite server started', { host, port });
        });
      },
    },
    // #endregion
  ],
  server: {
    host: '127.0.0.1',
    // Port 5174: 5173 often triggers EACCES on Windows (reserved/excluded port range)
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
