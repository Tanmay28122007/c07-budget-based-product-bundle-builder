import app from '../api-server.ts';

export default function handler(req: any, res: any) {
  const original = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-original-url'];
  if (original && typeof original === 'string') {
    req.url = original;
  }
  return app(req, res);
}
