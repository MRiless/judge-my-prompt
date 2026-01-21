import { Router, Request, Response } from 'express';
import { configService } from '../services/configService.js';

const router = Router();

// GET /api/models - List all models
router.get('/', async (_req: Request, res: Response) => {
  try {
    const models = await configService.getModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// GET /api/models/:id - Get a specific model
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = await configService.getModel(id);

    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

// PUT /api/models/:id - Update a model
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const model = await configService.updateModel(id, updates);
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json(model);
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({ error: 'Failed to update model' });
  }
});

// POST /api/models/:id/toggle - Toggle a model on/off
router.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const model = await configService.toggleModel(id, enabled);
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json(model);
  } catch (error) {
    console.error('Error toggling model:', error);
    res.status(500).json({ error: 'Failed to toggle model' });
  }
});

// PUT /api/models/:id/lever-weights - Update model-specific lever weights
router.put('/:id/lever-weights', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leverWeights } = req.body;

    if (!leverWeights || typeof leverWeights !== 'object') {
      res.status(400).json({ error: 'leverWeights must be an object' });
      return;
    }

    const model = await configService.updateModelLeverWeights(id, leverWeights);
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json(model);
  } catch (error) {
    console.error('Error updating lever weights:', error);
    res.status(500).json({ error: 'Failed to update lever weights' });
  }
});

export default router;
