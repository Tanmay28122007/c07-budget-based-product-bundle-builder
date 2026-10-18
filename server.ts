import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './api-server.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Dev vs Production static handling for local/standalone running
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: __dirname,
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} (and http://127.0.0.1:${PORT}) [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

// Only launch standalone listener if not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
