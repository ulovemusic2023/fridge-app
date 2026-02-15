/**
 * AddFoodOverlay — HTML overlay buttons that appear over open compartments.
 * Dynamically positioned based on compartment count and index.
 */

import type { FridgeConfig } from '../types/fridge';

interface AddFoodOverlayProps {
  openDoors: Record<string, boolean>;
  onAddFood: (compartment: string) => void;
  fridgeConfig: FridgeConfig | null;
}

export default function AddFoodOverlay({ openDoors, onAddFood, fridgeConfig }: AddFoodOverlayProps) {
  const compartments = fridgeConfig?.compartments ?? [];
  const total = compartments.length;
  if (total === 0) return null;

  return (
    <>
      {compartments.map((comp, index) => {
        if (!openDoors[comp.id]) return null;
        // Calculate vertical position percentage based on index
        // Distribute buttons evenly across the middle area (20%-80% of viewport)
        const topPct = 20 + ((index + 0.5) / total) * 55;
        return (
          <button
            key={comp.id}
            onClick={(e) => {
              e.stopPropagation();
              onAddFood(comp.id);
            }}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 
              bg-blue-500/90 hover:bg-blue-600 text-white text-xs font-medium
              px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm
              transition-all hover:scale-105 active:scale-95
              pointer-events-auto"
            style={{ top: `${topPct}%`, left: '50%' }}
          >
            ＋ 加入食物
          </button>
        );
      })}
    </>
  );
}
