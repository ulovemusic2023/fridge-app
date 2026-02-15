/**
 * StyleSelection — Choose fridge style and color, with premium 2D preview.
 */

import { useState } from 'react';
import type { FridgeStyle, CompartmentInstance } from '../../types/fridge';
import { STYLE_PRESETS, COMPARTMENT_TYPES } from '../../types/fridge';
import Fridge2D from '../Fridge2D';

interface StyleSelectionProps {
  compartments: CompartmentInstance[];
  fridgeName: string;
  photo?: string | null;
  onFinish: (style: FridgeStyle, color: string) => void;
  onBack: () => void;
}

const COLOR_PRESETS = [
  { color: '#e8e8e8', label: '白色' },
  { color: '#f4a460', label: '橘色' },
  { color: '#87ceeb', label: '天藍' },
  { color: '#98fb98', label: '薄荷' },
  { color: '#ffb6c1', label: '粉紅' },
  { color: '#dda0dd', label: '紫色' },
  { color: '#2c2c2c', label: '黑色' },
];

const STYLE_ICONS: Record<string, string> = {
  retro: '🏛️',
  modern: '🔲',
  cute: '🎀',
};

const STYLE_BG: Record<string, string> = {
  retro: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  modern: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
  cute: 'linear-gradient(135deg, #fce7f3, #f5d0fe)',
};

export default function StyleSelection({ compartments, fridgeName, onFinish, onBack }: StyleSelectionProps) {
  const [style, setStyle] = useState<FridgeStyle>('modern');
  const [color, setColor] = useState('#e8e8e8');

  // Build open doors record (all closed for preview)
  const openDoors: Record<string, boolean> = {};
  for (const c of compartments) {
    openDoors[c.id] = false;
  }

  // Suppress unused COMPARTMENT_TYPES import (it's used by Fridge2D internally)
  void COMPARTMENT_TYPES;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="glass-strong" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
      }}>
        <button
          onClick={onBack}
          className="btn-hover-scale"
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(0,0,0,0.04)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#6b7280',
          }}
        >
          ← 返回
        </button>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1f2937' }}>🎨 外觀風格</h2>
        <span style={{ fontSize: '12px', color: '#8b8b9e', marginLeft: 'auto', fontWeight: 600 }}>{fridgeName}</span>
      </div>

      {/* 2D Preview */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Fridge2D
          fridgeConfig={{ name: fridgeName, compartments, style, color }}
          style={style}
          color={color}
          openDoors={openDoors}
          foods={[]}
          onToggleDoor={() => {}}
          onAddFood={() => {}}
          onFoodClick={() => {}}
        />
      </div>

      {/* Style & Color controls */}
      <div className="glass-strong" style={{
        borderTop: '1px solid rgba(255,255,255,0.3)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Style selector — larger previews with background context */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#8b8b9e', marginBottom: '8px', display: 'block' }}>風格</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {STYLE_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setStyle(preset.id)}
                className="btn-hover-scale"
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '14px',
                  border: style === preset.id
                    ? '2px solid #6366f1'
                    : '2px solid transparent',
                  background: STYLE_BG[preset.id] || 'rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: style === preset.id
                    ? '0 4px 12px rgba(99,102,241,0.2)'
                    : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{STYLE_ICONS[preset.id]}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{preset.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color selector */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#8b8b9e', marginBottom: '8px', display: 'block' }}>顏色</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {COLOR_PRESETS.map(({ color: c, label }) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={label}
                className="btn-hover-scale"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: color === c
                    ? '3px solid #6366f1'
                    : '2px solid rgba(0,0,0,0.08)',
                  backgroundColor: c,
                  cursor: 'pointer',
                  boxShadow: color === c
                    ? '0 0 0 3px rgba(99,102,241,0.15)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              />
            ))}
            <label className="relative cursor-pointer" title="自訂顏色">
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px dashed rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                color: '#a1a1aa',
              }}>
                +
              </div>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Finish button */}
        <button
          onClick={() => onFinish(style, color)}
          className="btn-hover-scale"
          style={{
            width: '100%',
            padding: '14px',
            fontWeight: 700,
            fontSize: '15px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
          }}
        >
          ✅ 完成設定
        </button>
      </div>
    </div>
  );
}
