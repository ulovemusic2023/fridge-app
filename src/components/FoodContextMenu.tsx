/**
 * FoodContextMenu — Premium dropdown with edit/delete options.
 */

import { useEffect, useRef } from 'react';
import type { FoodItem } from '../types/fridge';

interface FoodContextMenuProps {
  open: boolean;
  food: FoodItem | null;
  x: number;
  y: number;
  onEdit: (food: FoodItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function FoodContextMenu({ open, food, x, y, onEdit, onDelete, onClose }: FoodContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, onClose]);

  if (!open || !food) return null;

  // Clamp menu position to viewport
  const menuW = 160;
  const menuH = 100;
  const clampedX = Math.min(x, window.innerWidth - menuW - 8);
  const clampedY = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 animate-fade-in-up"
      style={{
        left: clampedX,
        top: clampedY,
        background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.5)',
        padding: '6px',
        minWidth: '140px',
      }}
    >
      <button
        onClick={() => { onEdit(food); }}
        className="btn-hover-scale"
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '10px 14px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#374151',
          borderRadius: '10px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span>✏️</span>
        <span>修改</span>
      </button>
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '2px 8px' }} />
      <button
        onClick={() => { onDelete(food.id); onClose(); }}
        className="btn-hover-scale"
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '10px 14px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#ef4444',
          borderRadius: '10px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span>🗑️</span>
        <span>刪除</span>
      </button>
    </div>
  );
}
