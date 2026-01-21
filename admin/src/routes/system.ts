import { Router, Request, Response } from 'express';
import { configService } from '../services/configService.js';

const router = Router();

// GET /api/system/health - Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// GET /api/system/export - Export all configuration
router.get('/export', async (_req: Request, res: Response) => {
  try {
    const config = await configService.exportConfig();
    res.json(config);
  } catch (error) {
    console.error('Error exporting config:', error);
    res.status(500).json({ error: 'Failed to export configuration' });
  }
});

// POST /api/system/import - Import configuration
router.post('/import', async (req: Request, res: Response) => {
  try {
    const config = req.body;

    if (!config || (typeof config !== 'object')) {
      res.status(400).json({ error: 'Invalid configuration format' });
      return;
    }

    await configService.importConfig(config);
    res.json({ success: true, message: 'Configuration imported successfully' });
  } catch (error) {
    console.error('Error importing config:', error);
    res.status(500).json({ error: 'Failed to import configuration' });
  }
});

export default router;
