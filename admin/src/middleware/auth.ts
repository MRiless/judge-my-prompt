import { Request, Response, NextFunction } from 'express';

// Simple secret-based auth for localhost admin access
// In production, this should use proper authentication

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip auth for health endpoint
  if (req.path === '/api/system/health') {
    next();
    return;
  }

  // In development/localhost, allow all requests
  const host = req.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    next();
    return;
  }

  // For non-localhost, require admin secret
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    // If no secret configured, deny non-localhost access
    res.status(403).json({ error: 'Admin access not configured' });
    return;
  }

  const providedSecret = req.headers['x-admin-secret'] || req.query.secret;
  if (providedSecret !== adminSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
