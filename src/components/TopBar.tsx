/**
 * TopBar — Glassmorphism header with style presets, color picker, and settings.
 * Fixed at the top of the viewport.
 */

import type { FridgeStyle } from '../types/fridge';
import { STYLE_PRESETS } from '../types/fridge';

interface TopBarProps {
  currentStyle: FridgeStyle;
  currentColor: string;
  fridgeName?: string;
  onStyleChange: (style: FridgeStyle) => void;
  onColorChange: (color: string) => void;
  onToggleSidebar: () => void;
  onSettings?: () => void;
}

// Preset colors for quick selection
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

export default function TopBar({
  currentStyle,
  currentColor,
  fridgeName,
  onStyleChange,
  onColorChange,
  onToggleSidebar,
  onSettings,
}: TopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 glass-strong"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        padding: '10px 16px',
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sidebar toggle (mobile) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-white/40 transition-all btn-hover-scale"
          aria-label="切換側邊欄"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* App title */}
        <h1 style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#374151',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}>
          🧊 {fridgeName || '冰箱管家'}
        </h1>

        <div style={{
          height: '20px',
          width: '1px',
          background: 'rgba(0,0,0,0.08)',
        }} className="hidden sm:block" />

        {/* Style presets */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '11px', color: '#8b8b9e', fontWeight: 600 }} className="hidden sm:inline">風格</span>
          {STYLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onStyleChange(preset.id)}
              className="btn-hover-scale"
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                background: currentStyle === preset.id
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(0,0,0,0.04)',
                color: currentStyle === preset.id ? '#fff' : '#6b7280',
                boxShadow: currentStyle === preset.id
                  ? '0 2px 8px rgba(99,102,241,0.3)'
                  : 'none',
              }}
            >
              {STYLE_ICONS[preset.id]} {preset.label}
            </button>
          ))}
        </div>

        <div style={{
          height: '20px',
          width: '1px',
          background: 'rgba(0,0,0,0.08)',
        }} className="hidden sm:block" />

        {/* Color presets */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '11px', color: '#8b8b9e', fontWeight: 600 }} className="hidden sm:inline">顏色</span>
          {COLOR_PRESETS.map(({ color, label }) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              title={label}
              className="btn-hover-scale"
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: currentColor === color
                  ? '2.5px solid #6366f1'
                  : '2px solid rgba(0,0,0,0.1)',
                backgroundColor: color,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: currentColor === color
                  ? '0 0 0 2px rgba(99,102,241,0.2)'
                  : 'none',
              }}
              aria-label={label}
            />
          ))}
          <label className="relative cursor-pointer" title="自訂顏色">
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              border: '2px dashed rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#a1a1aa',
            }}>
              +
            </div>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings button */}
        {onSettings && (
          <button
            onClick={onSettings}
            className="btn-hover-scale"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.04)',
              color: '#6b7280',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="設定"
          >
            ⚙️ 設定
          </button>
        )}
      </div>
    </div>
  );
}
