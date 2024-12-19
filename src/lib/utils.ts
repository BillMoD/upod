import { MODEL_HIERARCHY } from './constants';

export function formatToothName(meshName: string): string {
  // Check in all categories (SKELETAL, BOTTOM, TOP)
  for (const category of Object.values(MODEL_HIERARCHY)) {
    for (const [key, value] of Object.entries(category)) {
      if (value === meshName) {
        // Convert from camelCase to readable format
        return key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }
  return meshName;
}