import fs from 'fs';
import path from 'path';
import {
  ExpectedProfitsConfig,
  DEFAULT_EXPECTED_PROFITS,
  normalizeExpectedProfits,
} from './expectedProfitsConfig';

export * from './expectedProfitsConfig';

const CACHE_FILE_PATH = path.join(process.cwd(), '.expected_profits_cache.json');
let inMemoryProfits: ExpectedProfitsConfig = { ...DEFAULT_EXPECTED_PROFITS };

export function getExpectedProfits(): ExpectedProfitsConfig {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      inMemoryProfits = normalizeExpectedProfits(parsed);
      return inMemoryProfits;
    }
  } catch (e) {
    console.warn('Note reading expected profits cache:', e);
  }
  return inMemoryProfits;
}

export function saveExpectedProfits(config: any): ExpectedProfitsConfig {
  const normalized = normalizeExpectedProfits(config);
  inMemoryProfits = {
    ...normalized,
    updatedAt: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(inMemoryProfits, null, 2), 'utf8');
  } catch (e) {
    console.warn('Note writing expected profits cache:', e);
  }
  return inMemoryProfits;
}
