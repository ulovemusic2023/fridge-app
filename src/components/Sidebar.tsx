/**
 * Sidebar — Card-based collapsible panel showing food list grouped by compartment.
 * Clean design with colored badges and section headers.
 */

import type { FoodItem, FridgeConfig } from '../types/fridge';
import { getCategoryInfo, getCompartmentLabel, COMPARTMENT_TYPES } from '../types/fridge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onFoodClick: (food: FoodItem, x: number, y: number) => void;
  fridgeConfig: FridgeConfig | null;
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function daysUntilExpiry(iso: string): string {
  const now = Date.now();
  const expiryTime = new Date(iso).getTime();
  const days = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
  if (days <= 0) return '已過期';
  if (days === 1) return '明天到期';
  return `${days} 天後到期`;
}

const BADGE_CLASSES: Record<string, string> = {
  ok: 'badge-ok',
  warning: 'badge-warning',
  danger: 'badge-danger',
  expired: 'badge-expired',
};

export default function Sidebar({ isOpen, onClose, foods, onFoodClick, fridgeConfig }: SidebarProps) {
  const compartments = fridgeConfig?.compartments ?? [];

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

  const totalCount = foods.length;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden modal-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 h-full z-40 glass-strong
          transform transition-transform duration-300 ease-in-out
          w-72 md:w-64 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:shadow-none
          ${isOpen ? 'md:block' : 'md:hidden'}
        `}
        style={{
          borderRight: '1px solid rgba(255,255,255,0.3)',
          boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* Sidebar header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#374151',
            letterSpacing: '-0.01em',
          }}>
            📦 食物清單
            {totalCount > 0 && (
              <span style={{
                marginLeft: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#6366f1',
                backgroundColor: '#eef2ff',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {totalCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="md:hidden btn-hover-scale"
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(0,0,0,0.04)',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#9ca3af',
            }}
            aria-label="關閉側邊欄"
          >
            ✕
          </button>
        </div>

        {/* Food list */}
        <div className="p-3 sidebar-scroll overflow-y-auto" style={{ height: 'calc(100% - 52px)' }}>
          {totalCount === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 16px',
              color: '#a1a1aa',
            }}>
              <p style={{ fontSize: '40px', marginBottom: '12px' }} className="animate-float">🍎</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>冰箱裡還沒有食物</p>
              <p style={{ fontSize: '11px', marginTop: '6px', color: '#a1a1aa' }}>打開門後點擊「＋ 加入食物」</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {compartments.map(({ id, typeId }) => {
                const compartmentFoods = foodsByCompartment[id] ?? [];
                if (compartmentFoods.length === 0) return null;
                const typeInfo = COMPARTMENT_TYPES[typeId];
                const icon = typeInfo?.icon ?? '📦';

                return (
                  <div key={id}>
                    {/* Section header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      paddingBottom: '6px',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                    }}>
                      <span style={{ fontSize: '14px' }}>{icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#4b5563' }}>
                        {getCompartmentLabel(id, fridgeConfig)}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#a1a1aa',
                        marginLeft: 'auto',
                      }}>
                        {compartmentFoods.length}
                      </span>
                    </div>

                    {/* Food items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {compartmentFoods.map(food => {
                        const status = getExpiryStatus(food);
                        const catInfo = getCategoryInfo(food.category);
                        return (
                          <div
                            key={food.id}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              onFoodClick(food, rect.right + 4, rect.top);
                            }}
                            className="btn-hover-scale"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              backgroundColor: 'rgba(255,255,255,0.5)',
                              borderLeft: `3px solid ${catInfo.color}`,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <p style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: status === 'expired' ? '#a1a1aa' : '#374151',
                                  textDecoration: status === 'expired' ? 'line-through' : 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {food.name}
                                  {food.quantity > 1 && (
                                    <span style={{ color: '#a1a1aa', fontWeight: 400 }}> ×{food.quantity}</span>
                                  )}
                                </p>
                              </div>
                              <p style={{
                                fontSize: '10px',
                                color: '#a1a1aa',
                                marginTop: '1px',
                              }}>
                                {formatDate(food.dateAdded)} → {formatDate(food.expiryDate)}
                              </p>
                            </div>
                            {/* Expiry badge */}
                            <span
                              className={BADGE_CLASSES[status]}
                              style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {daysUntilExpiry(food.expiryDate)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
