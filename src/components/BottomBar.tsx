/**
 * BottomBar — Pill-shaped compartment selector buttons.
 * Fixed at the bottom of the viewport with glassmorphism.
 */

import type { FridgeConfig } from '../types/fridge';
import { COMPARTMENT_TYPES } from '../types/fridge';

interface BottomBarProps {
  openDoors: Record<string, boolean>;
  onToggleDoor: (compartment: string) => void;
  fridgeConfig: FridgeConfig | null;
}

export default function BottomBar({ openDoors, onToggleDoor, fridgeConfig }: BottomBarProps) {
  const compartments = fridgeConfig?.compartments ?? [];

  if (compartments.length === 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 glass-strong"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
        padding: '10px 16px',
      }}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {compartments.map(({ id, typeId }) => {
          const isOpen = openDoors[id] ?? false;
          const typeInfo = COMPARTMENT_TYPES[typeId];
          const label = typeInfo?.name?.replace('室', '') ?? typeId;
          const icon = typeInfo?.icon ?? '📦';
          return (
            <button
              key={id}
              onClick={() => onToggleDoor(id)}
              className="pill-btn"
              style={{
                background: isOpen
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.5)',
                color: isOpen ? '#fff' : '#6b7280',
                boxShadow: isOpen
                  ? '0 4px 12px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
                fontSize: '12px',
                padding: '8px 14px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{icon}</span>
              <span style={{ fontWeight: 700 }}>{label}</span>
              <span style={{
                fontSize: '9px',
                opacity: 0.7,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: '6px',
                backgroundColor: isOpen ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
              }}>
                {isOpen ? '開' : '關'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
