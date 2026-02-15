// Global state management for fridge app using React context-free approach

import { useState, useCallback, useEffect } from 'react';
import type { FridgeStyle, FoodItem, FoodCategory, FridgeConfig } from '../types/fridge';
import { getCategoryInfo, loadFridgeConfig, saveFridgeConfig } from '../types/fridge';

export type SetupStep = 'welcome' | 'template' | 'compartments' | 'style' | null;

export interface FridgeState {
  // Fridge configuration (null = not configured yet)
  fridgeConfig: FridgeConfig | null;
  // Setup wizard step (null = not in setup)
  setupStep: SetupStep;
  // Door open states — keyed by compartment instance id
  openDoors: Record<string, boolean>;
  // Fridge body color (hex)
  fridgeColor: string;
  // Active style preset
  style: FridgeStyle;
  // Sidebar collapsed state
  sidebarOpen: boolean;
  // Camera view mode
  cameraView: 'default' | 'top';
  // Food items
  foods: FoodItem[];
  // Add food modal state
  addFoodModal: { open: boolean; compartment: string | null };
  // Edit food modal state
  editFoodModal: { open: boolean; food: FoodItem | null };
  // Context menu state
  contextMenu: { open: boolean; food: FoodItem | null; x: number; y: number };
}

export interface FridgeActions {
  toggleDoor: (compartment: string) => void;
  setFridgeColor: (color: string) => void;
  setStyle: (style: FridgeStyle) => void;
  toggleSidebar: () => void;
  setCameraView: (view: 'default' | 'top') => void;
  // Food actions
  addFood: (food: Omit<FoodItem, 'id'>) => void;
  updateFood: (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => void;
  deleteFood: (id: string) => void;
  openAddFoodModal: (compartment: string) => void;
  closeAddFoodModal: () => void;
  openEditFoodModal: (food: FoodItem) => void;
  closeEditFoodModal: () => void;
  openContextMenu: (food: FoodItem, x: number, y: number) => void;
  closeContextMenu: () => void;
  // Setup actions
  setSetupStep: (step: SetupStep) => void;
  finishSetup: (config: FridgeConfig) => void;
  enterSettings: () => void;
  resetFridge: () => void;
}

const FOODS_STORAGE_KEY = 'fridge-app-foods';

function loadFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(FOODS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FoodItem[];
  } catch {
    // ignore
  }
  return [];
}

function saveFoods(foods: FoodItem[]) {
  localStorage.setItem(FOODS_STORAGE_KEY, JSON.stringify(foods));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getDefaultExpiryDate(category: FoodCategory, dateAdded: string): string {
  const info = getCategoryInfo(category);
  const d = new Date(dateAdded);
  d.setDate(d.getDate() + info.defaultExpiryDays);
  return d.toISOString();
}

function buildInitialOpenDoors(config: FridgeConfig | null): Record<string, boolean> {
  const doors: Record<string, boolean> = {};
  if (config) {
    for (const c of config.compartments) {
      doors[c.id] = false;
    }
  }
  return doors;
}

function buildInitialState(): FridgeState {
  const config = loadFridgeConfig();
  return {
    fridgeConfig: config,
    setupStep: config ? null : 'welcome',
    openDoors: buildInitialOpenDoors(config),
    fridgeColor: config?.color ?? '#e8e8e8',
    style: config?.style ?? 'modern',
    sidebarOpen: false,
    cameraView: 'default',
    foods: loadFoods(),
    addFoodModal: { open: false, compartment: null },
    editFoodModal: { open: false, food: null },
    contextMenu: { open: false, food: null, x: 0, y: 0 },
  };
}

/**
 * Custom hook for fridge state management.
 * Returns [state, actions] tuple.
 */
export function useFridgeStore(): [FridgeState, FridgeActions] {
  const [state, setState] = useState<FridgeState>(buildInitialState);

  // Persist foods to localStorage whenever they change
  useEffect(() => {
    saveFoods(state.foods);
  }, [state.foods]);

  const toggleDoor = useCallback((compartment: string) => {
    setState(prev => ({
      ...prev,
      openDoors: {
        ...prev.openDoors,
        [compartment]: !prev.openDoors[compartment],
      },
    }));
  }, []);

  const setFridgeColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, fridgeColor: color }));
  }, []);

  const setStyle = useCallback((style: FridgeStyle) => {
    setState(prev => ({ ...prev, style }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setCameraView = useCallback((view: 'default' | 'top') => {
    setState(prev => ({ ...prev, cameraView: view }));
  }, []);

  // Food actions
  const addFood = useCallback((food: Omit<FoodItem, 'id'>) => {
    const newFood: FoodItem = { ...food, id: generateId() };
    setState(prev => ({ ...prev, foods: [...prev.foods, newFood] }));
  }, []);

  const updateFood = useCallback((id: string, updates: Partial<Omit<FoodItem, 'id'>>) => {
    setState(prev => ({
      ...prev,
      foods: prev.foods.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  }, []);

  const deleteFood = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      foods: prev.foods.filter(f => f.id !== id),
    }));
  }, []);

  const openAddFoodModal = useCallback((compartment: string) => {
    setState(prev => ({ ...prev, addFoodModal: { open: true, compartment } }));
  }, []);

  const closeAddFoodModal = useCallback(() => {
    setState(prev => ({ ...prev, addFoodModal: { open: false, compartment: null } }));
  }, []);

  const openEditFoodModal = useCallback((food: FoodItem) => {
    setState(prev => ({
      ...prev,
      editFoodModal: { open: true, food },
      contextMenu: { open: false, food: null, x: 0, y: 0 },
    }));
  }, []);

  const closeEditFoodModal = useCallback(() => {
    setState(prev => ({ ...prev, editFoodModal: { open: false, food: null } }));
  }, []);

  const openContextMenu = useCallback((food: FoodItem, x: number, y: number) => {
    setState(prev => ({ ...prev, contextMenu: { open: true, food, x, y } }));
  }, []);

  const closeContextMenu = useCallback(() => {
    setState(prev => ({ ...prev, contextMenu: { open: false, food: null, x: 0, y: 0 } }));
  }, []);

  // Setup actions
  const setSetupStep = useCallback((step: SetupStep) => {
    setState(prev => ({ ...prev, setupStep: step }));
  }, []);

  const finishSetup = useCallback((config: FridgeConfig) => {
    saveFridgeConfig(config);
    setState(prev => ({
      ...prev,
      fridgeConfig: config,
      setupStep: null,
      fridgeColor: config.color,
      style: config.style,
      openDoors: buildInitialOpenDoors(config),
    }));
  }, []);

  const enterSettings = useCallback(() => {
    setState(prev => ({ ...prev, setupStep: 'welcome' }));
  }, []);

  const resetFridge = useCallback(() => {
    localStorage.removeItem(FOODS_STORAGE_KEY);
    localStorage.removeItem('fridgeConfig');
    setState({
      fridgeConfig: null,
      setupStep: 'welcome',
      openDoors: {},
      fridgeColor: '#e8e8e8',
      style: 'modern',
      sidebarOpen: false,
      cameraView: 'default',
      foods: [],
      addFoodModal: { open: false, compartment: null },
      editFoodModal: { open: false, food: null },
      contextMenu: { open: false, food: null, x: 0, y: 0 },
    });
  }, []);

  const actions: FridgeActions = {
    toggleDoor,
    setFridgeColor,
    setStyle,
    toggleSidebar,
    setCameraView,
    addFood,
    updateFood,
    deleteFood,
    openAddFoodModal,
    closeAddFoodModal,
    openEditFoodModal,
    closeEditFoodModal,
    openContextMenu,
    closeContextMenu,
    setSetupStep,
    finishSetup,
    enterSettings,
    resetFridge,
  };

  return [state, actions];
}
