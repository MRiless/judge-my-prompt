import { Router, Request, Response } from 'express';
import { configService } from '../services/configService.js';

const router = Router();

// GET /api/levers - List all levers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const levers = await configService.getLevers();
    res.json(levers);
  } catch (error) {
    console.error('Error fetching levers:', error);
    res.status(500).json({ error: 'Failed to fetch levers' });
  }
});

// PUT /api/levers/:id - Update a lever
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lever = await configService.updateLever(id, updates);
    if (!lever) {
      res.status(404).json({ error: 'Lever not found' });
      return;
    }

    res.json(lever);
  } catch (error) {
    console.error('Error updating lever:', error);
    res.status(500).json({ error: 'Failed to update lever' });
  }
});

// POST /api/levers/:id/toggle - Toggle a lever on/off
router.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const lever = await configService.toggleLever(id, enabled);
    if (!lever) {
      res.status(404).json({ error: 'Lever not found' });
      return;
    }

    res.json(lever);
  } catch (error) {
    console.error('Error toggling lever:', error);
    res.status(500).json({ error: 'Failed to toggle lever' });
  }
});

// POST /api/levers/reorder - Reorder levers
router.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'orderedIds must be an array' });
      return;
    }

    const levers = await configService.reorderLevers(orderedIds);
    res.json(levers);
  } catch (error) {
    console.error('Error reordering levers:', error);
    res.status(500).json({ error: 'Failed to reorder levers' });
  }
});

export default router;
