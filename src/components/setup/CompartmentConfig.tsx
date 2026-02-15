/**
 * CompartmentConfig — Configure compartments with clean card-based design.
 */

import { useState } from 'react';
import type { CompartmentTypeId, CompartmentInstance } from '../../types/fridge';
import { COMPARTMENT_TYPES, ALL_COMPARTMENT_TYPE_IDS, createCompartmentInstances } from '../../types/fridge';

interface CompartmentConfigProps {
  initialTypeIds: CompartmentTypeId[];
  initialName?: string;
  photo?: string | null;
  onNext: (compartments: CompartmentInstance[], fridgeName: string) => void;
  onBack: () => void;
}

export default function CompartmentConfig({ initialTypeIds, initialName, photo, onNext, onBack }: CompartmentConfigProps) {
  const [typeIds, setTypeIds] = useState<CompartmentTypeId[]>(initialTypeIds);
  const [fridgeName, setFridgeName] = useState(initialName ?? '我的冰箱');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addCompartment = (typeId: CompartmentTypeId) => {
    setTypeIds(prev => [...prev, typeId]);
    setShowAddMenu(false);
  };

  const removeCompartment = (index: number) => {
    setTypeIds(prev => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setTypeIds(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= typeIds.length - 1) return;
    setTypeIds(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleNext = () => {
    if (typeIds.length === 0) return;
    const instances = createCompartmentInstances(typeIds);
    onNext(instances, fridgeName.trim() || '我的冰箱');
  };

  // Suppress unused var warning
  void photo;

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
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1f2937' }}>🔧 配置格層</h2>
      </div>

      <div className="flex-1 overflow-y-auto pretty-scroll" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo preview */}
          {photo && (
            <div style={{
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.5)',
              maxHeight: '160px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <img src={photo} alt="冰箱照片" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Fridge name */}
          <div className="card-soft" style={{ padding: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '8px' }}>
              冰箱命名
            </label>
            <input
              type="text"
              value={fridgeName}
              onChange={e => setFridgeName(e.target.value)}
              placeholder="例：廚房冰箱"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 500,
                background: 'rgba(255,255,255,0.8)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Compartment list */}
          <div className="card-soft" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563' }}>
                格層配置 ({typeIds.length} 層)
              </label>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="btn-hover-scale"
                style={{
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                }}
              >
                ➕ 新增格層
              </button>
            </div>

            {/* Add compartment dropdown */}
            {showAddMenu && (
              <div className="animate-fade-in-up" style={{
                marginBottom: '12px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)',
                padding: '8px',
              }}>
                <p style={{ fontSize: '11px', color: '#8b8b9e', padding: '4px 8px', fontWeight: 600 }}>選擇格層類型：</p>
                {ALL_COMPARTMENT_TYPE_IDS.map(typeId => {
                  const info = COMPARTMENT_TYPES[typeId];
                  return (
                    <button
                      key={typeId}
                      onClick={() => addCompartment(typeId)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{
                        fontSize: '18px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        backgroundColor: info.color + '50',
                      }}>
                        {info.icon}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{info.name}</span>
                      <span style={{ fontSize: '10px', color: '#a1a1aa', marginLeft: 'auto', fontWeight: 500 }}>{info.tempRange}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Compartment items */}
            {typeIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#a1a1aa', fontSize: '13px', fontWeight: 500 }}>
                請新增至少一個格層
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {typeIds.map((typeId, index) => {
                  const info = COMPARTMENT_TYPES[typeId];
                  return (
                    <div
                      key={`${typeId}-${index}`}
                      className="animate-fade-in-up"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: '14px',
                        borderLeft: `4px solid ${info.color}`,
                        animationDelay: `${index * 0.03}s`,
                      }}
                    >
                      <span style={{
                        fontSize: '20px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        backgroundColor: info.color + '40',
                        flexShrink: 0,
                      }}>
                        {info.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{info.name}</p>
                        <p style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 500 }}>{info.tempRange}</p>
                      </div>
                      {/* Reorder buttons */}
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="btn-hover-scale"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(0,0,0,0.04)',
                          cursor: index === 0 ? 'default' : 'pointer',
                          opacity: index === 0 ? 0.2 : 1,
                          fontSize: '12px',
                          color: '#6b7280',
                        }}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === typeIds.length - 1}
                        className="btn-hover-scale"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(0,0,0,0.04)',
                          cursor: index === typeIds.length - 1 ? 'default' : 'pointer',
                          opacity: index === typeIds.length - 1 ? 0.2 : 1,
                          fontSize: '12px',
                          color: '#6b7280',
                        }}
                      >
                        ↓
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => removeCompartment(index)}
                        className="btn-hover-scale"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(239,68,68,0.06)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#ef4444',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next button */}
      <div className="glass-strong" style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255,255,255,0.3)',
      }}>
        <button
          onClick={handleNext}
          disabled={typeIds.length === 0}
          className="btn-hover-scale"
          style={{
            width: '100%',
            padding: '14px',
            fontWeight: 700,
            fontSize: '15px',
            borderRadius: '16px',
            border: 'none',
            background: typeIds.length === 0 ? '#d1d5db' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            cursor: typeIds.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: typeIds.length > 0 ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
            opacity: typeIds.length === 0 ? 0.5 : 1,
          }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}
