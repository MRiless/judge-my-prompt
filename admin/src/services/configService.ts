import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Lever, ModelConfig } from '../types/shared/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const LEVERS_PATH = path.join(CONFIG_DIR, 'levers.json');
const MODELS_DIR = path.join(CONFIG_DIR, 'models');

interface LeversConfig {
  levers: Lever[];
}

export class ConfigService {
  // Levers
  async getLevers(): Promise<Lever[]> {
    const data = await fs.readFile(LEVERS_PATH, 'utf-8');
    const config: LeversConfig = JSON.parse(data);
    return config.levers;
  }

  async updateLever(id: string, updates: Partial<Lever>): Promise<Lever | null> {
    const levers = await this.getLevers();
    const index = levers.findIndex(l => l.id === id);

    if (index === -1) return null;

    levers[index] = { ...levers[index], ...updates };
    await this.saveLevers(levers);
    return levers[index];
  }

  async toggleLever(id: string, enabled: boolean): Promise<Lever | null> {
    return this.updateLever(id, { enabled });
  }

  async reorderLevers(orderedIds: string[]): Promise<Lever[]> {
    const levers = await this.getLevers();
    const leverMap = new Map(levers.map(l => [l.id, l]));

    const reordered = orderedIds
      .map((id, index) => {
        const lever = leverMap.get(id);
        if (lever) {
          lever.priority = index + 1;
          return lever;
        }
        return null;
      })
      .filter((l): l is Lever => l !== null);

    // Add any levers that weren't in the orderedIds list
    for (const lever of levers) {
      if (!orderedIds.includes(lever.id)) {
        reordered.push(lever);
      }
    }

    await this.saveLevers(reordered);
    return reordered;
  }

  private async saveLevers(levers: Lever[]): Promise<void> {
    const config: LeversConfig = { levers };
    await fs.writeFile(LEVERS_PATH, JSON.stringify(config, null, 2), 'utf-8');
  }

  // Models
  async getModels(): Promise<ModelConfig[]> {
    const files = await fs.readdir(MODELS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const models: ModelConfig[] = [];
    for (const file of jsonFiles) {
      const data = await fs.readFile(path.join(MODELS_DIR, file), 'utf-8');
      models.push(JSON.parse(data));
    }

    return models;
  }

  async getModel(id: string): Promise<ModelConfig | null> {
    try {
      const data = await fs.readFile(path.join(MODELS_DIR, `${id}.json`), 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async updateModel(id: string, updates: Partial<ModelConfig>): Promise<ModelConfig | null> {
    const model = await this.getModel(id);
    if (!model) return null;

    const updated = { ...model, ...updates };
    await this.saveModel(updated);
    return updated;
  }

  async toggleModel(id: string, enabled: boolean): Promise<ModelConfig | null> {
    return this.updateModel(id, { enabled });
  }

  async updateModelLeverWeights(
    modelId: string,
    leverWeights: Record<string, number>
  ): Promise<ModelConfig | null> {
    return this.updateModel(modelId, { leverWeights });
  }

  private async saveModel(model: ModelConfig): Promise<void> {
    await fs.writeFile(
      path.join(MODELS_DIR, `${model.id}.json`),
      JSON.stringify(model, null, 2),
      'utf-8'
    );
  }

  // System
  async exportConfig(): Promise<{ levers: Lever[]; models: ModelConfig[] }> {
    const [levers, models] = await Promise.all([
      this.getLevers(),
      this.getModels(),
    ]);
    return { levers, models };
  }

  async importConfig(config: { levers?: Lever[]; models?: ModelConfig[] }): Promise<void> {
    if (config.levers) {
      await this.saveLevers(config.levers);
    }

    if (config.models) {
      for (const model of config.models) {
        await this.saveModel(model);
      }
    }
  }
}

export const configService = new ConfigService();
