import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import leversRouter from './routes/levers.js';
import modelsRouter from './routes/models.js';
import systemRouter from './routes/system.js';
import claudeRouter from './routes/claude.js';
import analyzeRouter from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// AI analysis proxy routes - no auth required (user provides their own API key)
app.use('/api/analyze', analyzeRouter);
app.use('/api/claude', claudeRouter); // Legacy route for backwards compatibility

// Auth middleware for admin routes
app.use(authMiddleware);

// Routes
app.use('/api/levers', leversRouter);
app.use('/api/models', modelsRouter);
app.use('/api/system', systemRouter);

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Admin server running on http://localhost:${PORT}`);
  console.log(`  - Levers API: http://localhost:${PORT}/api/levers`);
  console.log(`  - Models API: http://localhost:${PORT}/api/models`);
  console.log(`  - System API: http://localhost:${PORT}/api/system`);
});
