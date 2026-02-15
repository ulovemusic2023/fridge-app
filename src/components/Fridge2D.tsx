/**
 * Fridge2D — Premium 2D illustrated fridge visualization.
 * Flat illustration / vector art style with gradients, reflections, and animations.
 */

import { useState } from 'react';
import type { FridgeStyle, FridgeConfig, FoodItem, CompartmentInstance } from '../types/fridge';
import { COMPARTMENT_TYPES, getCategoryInfo } from '../types/fridge';

interface Fridge2DProps {
  fridgeConfig: FridgeConfig | null;
  style: FridgeStyle;
  color: string;
  openDoors: Record<string, boolean>;
  foods: FoodItem[];
  onToggleDoor: (compartmentId: string) => void;
  onAddFood: (compartmentId: string) => void;
  onFoodClick: (food: FoodItem, x: number, y: number) => void;
}

function getExpiryStatus(food: FoodItem): 'ok' | 'warning' | 'danger' | 'expired' {
  const now = Date.now();
  const expiryTime = new Date(food.expiryDate).getTime();
  const daysLeft = (expiryTime - now) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 1) return 'danger';
  if (daysLeft <= 3) return 'warning';
  return 'ok';
}

function daysUntilExpiry(iso: string): string {
  const now = Date.now();
  const expiryTime = new Date(iso).getTime();
  const days = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
  if (days <= 0) return '已過期';
  if (days === 1) return '明天到期';
  return `${days}天`;
}

interface StyleConfig {
  borderRadius: string;
  handleClass: string;
  handleWidth: number;
  handleHeight: number;
  handleRadius: string;
  gapStyle: 'retro' | 'modern' | 'cute';
  accentEmoji: string;
  bodyGradient: string;
}

function getStyleConfig(style: FridgeStyle, color: string): StyleConfig {
  switch (style) {
    case 'retro':
      return {
        borderRadius: '6px',
        handleClass: 'handle-copper',
        handleWidth: 10,
        handleHeight: 70,
        handleRadius: '5px',
        gapStyle: 'retro',
        accentEmoji: '',
        bodyGradient: `linear-gradient(180deg, ${color} 0%, ${adjustBrightness(color, -10)} 100%)`,
      };
    case 'cute':
      return {
        borderRadius: '28px',
        handleClass: 'handle-cute',
        handleWidth: 12,
        handleHeight: 50,
        handleRadius: '6px',
        gapStyle: 'cute',
        accentEmoji: '✨',
        bodyGradient: `linear-gradient(180deg, ${adjustBrightness(color, 5)} 0%, ${color} 50%, ${adjustBrightness(color, -5)} 100%)`,
      };
    case 'modern':
    default:
      return {
        borderRadius: '16px',
        handleClass: 'handle-metallic',
        handleWidth: 6,
        handleHeight: 48,
        handleRadius: '3px',
        gapStyle: 'modern',
        accentEmoji: '',
        bodyGradient: `linear-gradient(180deg, ${adjustBrightness(color, 8)} 0%, ${color} 40%, ${adjustBrightness(color, -6)} 100%)`,
      };
  }
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(2.55 * percent)));
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

const EXPIRY_DOT_COLOR: Record<string, string> = {
  ok: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  expired: '#9ca3af',
};

function FoodPill({ food, onClick, index }: { food: FoodItem; onClick: (e: React.MouseEvent) => void; index: number }) {
  const status = getExpiryStatus(food);
  const catInfo = getCategoryInfo(food.category);

  return (
    <button
      onClick={onClick}
      className="animate-food-in btn-hover-scale"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px 6px 8px',
        borderRadius: '12px',
        borderLeft: `3px solid ${catInfo.color}`,
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(4px)',
        fontSize: '12px',
        fontWeight: 600,
        color: status === 'expired' ? '#9ca3af' : '#374151',
        textDecoration: status === 'expired' ? 'line-through' : 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        animationDelay: `${index * 0.05}s`,
        border: 'none',
        borderLeftStyle: 'solid',
      }}
    >
      {/* Expiry dot */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: EXPIRY_DOT_COLOR[status],
          flexShrink: 0,
        }}
      />
      <span>{food.name}</span>
      {food.quantity > 1 && <span style={{ color: '#a1a1aa', fontWeight: 400 }}>×{food.quantity}</span>}
      <span style={{
        fontSize: '10px',
        padding: '1px 6px',
        borderRadius: '6px',
        fontWeight: 500,
        backgroundColor: status === 'ok' ? '#dcfce7' : status === 'warning' ? '#fef9c3' : status === 'danger' ? '#fee2e2' : '#f3f4f6',
        color: status === 'ok' ? '#166534' : status === 'warning' ? '#854d0e' : status === 'danger' ? '#991b1b' : '#6b7280',
      }}>
        {daysUntilExpiry(food.expiryDate)}
      </span>
    </button>
  );
}

function CompartmentRow({
  comp,
  isOpen,
  isLast,
  foods,
  styleConfig,
  fridgeStyle,
  onToggle,
  onAddFood,
  onFoodClick,
}: {
  comp: CompartmentInstance;
  isOpen: boolean;
  isLast: boolean;
  foods: FoodItem[];
  styleConfig: StyleConfig;
  fridgeStyle: FridgeStyle;
  onToggle: () => void;
  onAddFood: () => void;
  onFoodClick: (food: FoodItem, x: number, y: number) => void;
}) {
  const typeInfo = COMPARTMENT_TYPES[comp.typeId];
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Compartment header — clickable to toggle */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          paddingRight: '40px',
          backgroundColor: hovered
            ? 'rgba(255,255,255,0.45)'
            : isOpen
              ? 'rgba(255,255,255,0.30)'
              : 'rgba(255,255,255,0.10)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          textAlign: 'left',
          position: 'relative',
        }}
      >
        <span style={{
          fontSize: '22px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          backgroundColor: typeInfo.color + '60',
          flexShrink: 0,
        }}>
          {typeInfo.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', letterSpacing: '0.02em' }}>
            {typeInfo.name}
            {fridgeStyle === 'cute' && ' ' + styleConfig.accentEmoji}
          </div>
          <div style={{ fontSize: '10px', color: '#8b8b9e', fontWeight: 500, marginTop: '1px' }}>{typeInfo.tempRange}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {foods.length > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#6366f1',
              backgroundColor: '#eef2ff',
              padding: '2px 8px',
              borderRadius: '10px',
            }}>
              {foods.length}
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              backgroundColor: isOpen ? '#6366f1' : 'rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
              fontSize: '10px',
              color: isOpen ? '#fff' : '#9ca3af',
            }}
          >
            <span style={{
              display: 'inline-block',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </span>
        </div>
      </button>

      {/* Compartment content — expands when open */}
      <div
        className={isOpen ? 'compartment-open-glow' : ''}
        style={{
          maxHeight: isOpen ? '400px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          opacity: isOpen ? 1 : 0,
          backgroundColor: isOpen ? typeInfo.color + '35' : 'transparent',
        }}
      >
        <div style={{ padding: '10px 18px 14px' }}>
          {foods.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              color: '#a1a1aa',
              fontSize: '12px',
              fontWeight: 500,
            }}>
              <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>📭</span>
              空的，還沒放食物
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {foods.map((food, index) => (
                <FoodPill
                  key={food.id}
                  food={food}
                  index={index}
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    onFoodClick(food, rect.right + 4, rect.top);
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onAddFood(); }}
            className="btn-hover-scale"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '2px dashed rgba(99, 102, 241, 0.3)',
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              color: '#6366f1',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.3)';
            }}
          >
            ＋ 加入食物
          </button>
        </div>
      </div>

      {/* Divider / gap between compartments */}
      {!isLast && (
        <div
          className="compartment-gap"
          style={{
            height: fridgeStyle === 'retro' ? '4px' : '3px',
            background: fridgeStyle === 'retro'
              ? 'linear-gradient(180deg, rgba(139,113,80,0.25) 0%, rgba(139,113,80,0.08) 50%, rgba(139,113,80,0.25) 100%)'
              : fridgeStyle === 'cute'
                ? 'linear-gradient(90deg, transparent 5%, rgba(244,114,182,0.2) 20%, rgba(244,114,182,0.3) 50%, rgba(244,114,182,0.2) 80%, transparent 95%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.08) 100%)',
          }}
        />
      )}
    </div>
  );
}

export default function Fridge2D({
  fridgeConfig,
  style,
  color,
  openDoors,
  foods,
  onToggleDoor,
  onAddFood,
  onFoodClick,
}: Fridge2DProps) {
  const compartments = fridgeConfig?.compartments ?? [];
  const styleConfig = getStyleConfig(style, color);

  // Group foods by compartment
  const foodsByCompartment: Record<string, FoodItem[]> = {};
  for (const c of compartments) {
    foodsByCompartment[c.id] = [];
  }
  for (const food of foods) {
    if (!foodsByCompartment[food.compartment]) {
      foodsByCompartment[food.compartment] = [];
    }
    foodsByCompartment[food.compartment].push(food);
  }

  // Cute mode decorations
  const cuteDecorations = style === 'cute' ? (
    <>
      <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '28px', zIndex: 5 }}
        className="animate-bounce-subtle"
      >
        🎀
      </div>
      <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '16px', zIndex: 5 }}
        className="animate-sparkle"
      >
        ✨
      </div>
      <div style={{ position: 'absolute', bottom: '12px', left: '14px', fontSize: '16px', zIndex: 5 }}
        className="animate-sparkle" 
      >
        💖
      </div>
      <div style={{ position: 'absolute', top: '50%', left: '10px', fontSize: '12px', opacity: 0.5, zIndex: 5 }}
        className="animate-sparkle"
      >
        ⭐
      </div>
    </>
  ) : null;

  // Retro badge
  const retroBadge = style === 'retro' ? (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 5,
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '0.15em',
      color: '#8b7355',
      textTransform: 'uppercase',
      fontFamily: 'Georgia, serif',
      opacity: 0.6,
    }}>
      FRIDGE CO.
    </div>
  ) : null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflow: 'auto',
      }}
    >
      {/* Fridge body */}
      <div
        className="fridge-body"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          borderRadius: styleConfig.borderRadius,
          background: styleConfig.bodyGradient,
          overflow: 'visible',
          boxShadow: style === 'retro'
            ? '6px 6px 0px rgba(139,113,80,0.2), 0 8px 32px rgba(0,0,0,0.12), inset 0 0 0 2px rgba(139,113,80,0.1)'
            : style === 'cute'
              ? '0 8px 40px rgba(244,114,182,0.15), 0 2px 12px rgba(0,0,0,0.06), inset 0 0 0 2px rgba(244,114,182,0.15)'
              : '0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.2)',
        }}
      >
        {/* Overflow container for compartments */}
        <div style={{ borderRadius: styleConfig.borderRadius, overflow: 'hidden', position: 'relative', zIndex: 3 }}>
          {/* Compartments */}
          {compartments.map((comp, index) => (
            <CompartmentRow
              key={comp.id}
              comp={comp}
              isOpen={openDoors[comp.id] ?? false}
              isLast={index === compartments.length - 1}
              foods={foodsByCompartment[comp.id] ?? []}
              styleConfig={styleConfig}
              fridgeStyle={style}
              onToggle={() => onToggleDoor(comp.id)}
              onAddFood={() => onAddFood(comp.id)}
              onFoodClick={onFoodClick}
            />
          ))}
        </div>

        {/* Reflection overlay */}
        <div className="fridge-reflection" style={{ borderRadius: styleConfig.borderRadius }} />

        {/* Handle */}
        <div
          className={styleConfig.handleClass}
          style={{
            position: 'absolute',
            right: style === 'cute' ? '14px' : '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${styleConfig.handleWidth}px`,
            height: `${styleConfig.handleHeight}px`,
            borderRadius: styleConfig.handleRadius,
            zIndex: 4,
          }}
        />

        {/* Decorations */}
        {cuteDecorations}
        {retroBadge}
      </div>

      {/* Floor shadow */}
      <div className="fridge-shadow" style={{ maxWidth: '380px' }} />

      {/* Fridge name label */}
      {fridgeConfig?.name && (
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#8b8b9e',
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}>
          {fridgeConfig.name}
        </div>
      )}
    </div>
  );
}
