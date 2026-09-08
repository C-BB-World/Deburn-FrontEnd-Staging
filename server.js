import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mockRouter from './mock/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

if (process.env.LOCAL_MOCK_DATA === 'true') {
  app.use('/api', mockRouter);
  console.log('API: serving mock data (LOCAL_MOCK_DATA=true)');
} else {
  if (!process.env.BACKEND_URL) {
    console.warn('LOCAL_MOCK_DATA is not "true" but BACKEND_URL is unset — /api requests will fail.');
  }
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.BACKEND_URL,
      changeOrigin: true,
    })
  );
  console.log(`API: proxying to ${process.env.BACKEND_URL || '(no BACKEND_URL set)'}`);
}

// Serve static files from dist/ with correct MIME types
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml');
    }
    if (path.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

// SPA fallback - serve index.html for all other routes
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
