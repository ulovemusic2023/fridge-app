// Fridge-related type definitions

// === Compartment Type Registry ===
export type CompartmentTypeId =
  | 'refrigerator'
  | 'freezer'
  | 'vegetable'
  | 'quickFreeze'
  | 'variableTemp'
  | 'iceMaker'
  | 'softFreeze'
  | 'vacuum'
  | 'chilled';

export interface CompartmentTypeInfo {
  name: string;
  icon: string;
  tempRange: string;
  color: string;
}

export const COMPARTMENT_TYPES: Record<CompartmentTypeId, CompartmentTypeInfo> = {
  refrigerator: { name: '冷藏室', icon: '🥩', tempRange: '2~8°C', color: '#E3F2FD' },
  freezer: { name: '冷凍室', icon: '🧊', tempRange: '-18~-24°C', color: '#E1F5FE' },
  vegetable: { name: '蔬果保鮮室', icon: '🥬', tempRange: '3~8°C', color: '#E8F5E9' },
  quickFreeze: { name: '急速冷凍室', icon: '❄️', tempRange: '-30~-40°C', color: '#B3E5FC' },
  variableTemp: { name: '變溫室', icon: '🔄', tempRange: '-18~8°C', color: '#FFF3E0' },
  iceMaker: { name: '製冰室', icon: '🧊', tempRange: '獨立製冰', color: '#E0F7FA' },
  softFreeze: { name: '微凍保鮮室', icon: '🥩', tempRange: '-3~-1°C', color: '#FCE4EC' },
  vacuum: { name: '真空冷藏室', icon: '🫙', tempRange: '約1°C', color: '#F3E5F5' },
  chilled: { name: '冰鮮室', icon: '🐟', tempRange: '-1~1°C', color: '#E8EAF6' },
};

// All available compartment type IDs (for dropdowns)
export const ALL_COMPARTMENT_TYPE_IDS: CompartmentTypeId[] = Object.keys(COMPARTMENT_TYPES) as CompartmentTypeId[];

// === Compartment Instance (in a configured fridge) ===
export interface CompartmentInstance {
  /** Unique instance id, e.g. "refrigerator-1" */
  id: string;
  /** The type of compartment */
  typeId: CompartmentTypeId;
}

// === Fridge Configuration ===
export type FridgeStyle = 'retro' | 'modern' | 'cute';

export interface FridgeConfig {
  /** Fridge name, e.g. "廚房冰箱" */
  name: string;
  /** Ordered list of compartments (top to bottom) */
  compartments: CompartmentInstance[];
  /** Visual style */
  style: FridgeStyle;
  /** Body color hex */
  color: string;
  /** Optional photo (data URL) */
  photo?: string;
}

// === Built-in Templates ===
export interface FridgeTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  compartmentTypes: CompartmentTypeId[];
}

export const FRIDGE_TEMPLATES: FridgeTemplate[] = [
  {
    id: 'two-door',
    name: '雙門冰箱',
    icon: '🏠',
    description: '冷藏 + 冷凍',
    compartmentTypes: ['refrigerator', 'freezer'],
  },
  {
    id: 'three-door',
    name: '三門冰箱',
    icon: '🏡',
    description: '冷藏 + 蔬果保鮮 + 冷凍',
    compartmentTypes: ['refrigerator', 'vegetable', 'freezer'],
  },
  {
    id: 'four-door',
    name: '四門冰箱',
    icon: '🏘️',
    description: '冷藏 + 變溫室 + 蔬果保鮮 + 冷凍',
    compartmentTypes: ['refrigerator', 'variableTemp', 'vegetable', 'freezer'],
  },
  {
    id: 'five-door',
    name: '五門日系冰箱',
    icon: '🏰',
    description: '冷藏 + 微凍保鮮 + 蔬果保鮮 + 製冰室 + 冷凍',
    compartmentTypes: ['refrigerator', 'softFreeze', 'vegetable', 'iceMaker', 'freezer'],
  },
  {
    id: 'six-door',
    name: '六門旗艦冰箱',
    icon: '👑',
    description: '冷藏 + 真空冷藏 + 微凍保鮮 + 蔬果保鮮 + 製冰室 + 冷凍',
    compartmentTypes: ['refrigerator', 'vacuum', 'softFreeze', 'vegetable', 'iceMaker', 'freezer'],
  },
  {
    id: 'custom',
    name: '自訂冰箱',
    icon: '🔧',
    description: '自由配置格層',
    compartmentTypes: ['refrigerator', 'freezer'],
  },
];

// === Food types (unchanged) ===
export type FoodCategory =
  | 'meat'
  | 'seafood'
  | 'vegetable'
  | 'fruit'
  | 'drink'
  | 'dairy'
  | 'leftover'
  | 'sauce'
  | 'other';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  /** compartment instance id (e.g. "refrigerator-1") */
  compartment: string;
  dateAdded: string;   // ISO string
  expiryDate: string;  // ISO string
}

export interface FoodCategoryInfo {
  id: FoodCategory;
  label: string;
  color: string;       // hex color for 3D display
  defaultExpiryDays: number;
}

// Legacy compat types — kept as type aliases
export type Compartment = string;

export interface CompartmentInfo {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
}

export interface StylePreset {
  id: FridgeStyle;
  label: string;
  labelEn: string;
  borderRadius: number;
  hasDecorations: boolean;
}

// Style preset definitions
export const STYLE_PRESETS: StylePreset[] = [
  { id: 'retro', label: '復古', labelEn: 'Retro', borderRadius: 0.02, hasDecorations: true },
  { id: 'modern', label: '現代', labelEn: 'Modern', borderRadius: 0.05, hasDecorations: false },
  { id: 'cute', label: '可愛', labelEn: 'Cute/Kawaii', borderRadius: 0.15, hasDecorations: true },
];

// Food category definitions
export const FOOD_CATEGORIES: FoodCategoryInfo[] = [
  { id: 'meat', label: '肉類', color: '#e74c3c', defaultExpiryDays: 3 },
  { id: 'seafood', label: '海鮮', color: '#3498db', defaultExpiryDays: 2 },
  { id: 'vegetable', label: '蔬菜', color: '#27ae60', defaultExpiryDays: 7 },
  { id: 'fruit', label: '水果', color: '#f39c12', defaultExpiryDays: 5 },
  { id: 'drink', label: '飲料', color: '#1abc9c', defaultExpiryDays: 30 },
  { id: 'dairy', label: '乳製品', color: '#ecf0f1', defaultExpiryDays: 7 },
  { id: 'leftover', label: '剩菜', color: '#9b59b6', defaultExpiryDays: 3 },
  { id: 'sauce', label: '醬料', color: '#e67e22', defaultExpiryDays: 60 },
  { id: 'other', label: '其他', color: '#95a5a6', defaultExpiryDays: 7 },
];

// Helper: get category info by id
export function getCategoryInfo(id: FoodCategory): FoodCategoryInfo {
  return FOOD_CATEGORIES.find(c => c.id === id) ?? FOOD_CATEGORIES[FOOD_CATEGORIES.length - 1];
}

// Helper: get compartment label from instance id & config
export function getCompartmentLabel(instanceId: string, config?: FridgeConfig | null): string {
  if (config) {
    const inst = config.compartments.find(c => c.id === instanceId);
    if (inst) {
      return COMPARTMENT_TYPES[inst.typeId]?.name ?? instanceId;
    }
  }
  // Fallback: try to extract typeId from instance id (e.g. "refrigerator-1" → "refrigerator")
  const typeId = instanceId.replace(/-\d+$/, '') as CompartmentTypeId;
  return COMPARTMENT_TYPES[typeId]?.name ?? instanceId;
}

// Helper: build CompartmentInfo array from FridgeConfig (for components that need it)
export function getCompartmentsFromConfig(config: FridgeConfig): CompartmentInfo[] {
  return config.compartments.map(inst => {
    const typeInfo = COMPARTMENT_TYPES[inst.typeId];
    return {
      id: inst.id,
      label: typeInfo?.name ?? inst.typeId,
      labelEn: inst.typeId,
      icon: typeInfo?.icon ?? '📦',
    };
  });
}

// Helper: create compartment instances from type IDs
export function createCompartmentInstances(typeIds: CompartmentTypeId[]): CompartmentInstance[] {
  const counts: Record<string, number> = {};
  return typeIds.map(typeId => {
    counts[typeId] = (counts[typeId] || 0) + 1;
    return {
      id: `${typeId}-${counts[typeId]}`,
      typeId,
    };
  });
}

// === FridgeConfig localStorage helpers ===
const FRIDGE_CONFIG_KEY = 'fridgeConfig';

export function loadFridgeConfig(): FridgeConfig | null {
  try {
    const raw = localStorage.getItem(FRIDGE_CONFIG_KEY);
    if (raw) return JSON.parse(raw) as FridgeConfig;
  } catch {
    // ignore
  }
  return null;
}

export function saveFridgeConfig(config: FridgeConfig): void {
  localStorage.setItem(FRIDGE_CONFIG_KEY, JSON.stringify(config));
}

export function clearFridgeConfig(): void {
  localStorage.removeItem(FRIDGE_CONFIG_KEY);
}
