/**
 * TemplateSelection — Mini fridge illustrations for template selection.
 */

import { FRIDGE_TEMPLATES, COMPARTMENT_TYPES } from '../../types/fridge';
import type { CompartmentTypeId } from '../../types/fridge';

interface TemplateSelectionProps {
  onSelect: (templateId: string, compartmentTypes: CompartmentTypeId[]) => void;
  onBack: () => void;
}

/** Mini fridge illustration showing compartment layout */
function MiniFridge({ compartmentTypes }: { compartmentTypes: CompartmentTypeId[] }) {
  const count = compartmentTypes.length;
  return (
    <div style={{
      width: '44px',
      height: '64px',
      borderRadius: '8px',
      background: 'linear-gradient(180deg, #a5d8ff 0%, #74c0fc 100%)',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(74,192,247,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
    }}>
      {/* Compartment divisions */}
      {compartmentTypes.map((typeId, idx) => {
        const info = COMPARTMENT_TYPES[typeId];
        const height = 100 / count;
        return (
          <div key={`${typeId}-${idx}`} style={{
            position: 'absolute',
            top: `${idx * height}%`,
            left: 0,
            right: 0,
            height: `${height}%`,
            backgroundColor: info.color + '60',
            borderBottom: idx < count - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: height > 25 ? '10px' : '8px',
          }}>
            {info.icon}
          </div>
        );
      })}
      {/* Handle */}
      <div style={{
        position: 'absolute',
        right: '3px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '2px',
        height: '12px',
        borderRadius: '1px',
        background: 'linear-gradient(180deg, #dee2e6, #adb5bd, #dee2e6)',
        zIndex: 2,
      }} />
      {/* Highlight */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
    </div>
  );
}

export default function TemplateSelection({ onSelect, onBack }: TemplateSelectionProps) {
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
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1f2937' }}>📋 選擇冰箱型號</h2>
      </div>

      {/* Template cards */}
      <div className="flex-1 overflow-y-auto pretty-scroll" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FRIDGE_TEMPLATES.map((template, idx) => (
            <button
              key={template.id}
              onClick={() => onSelect(template.id, template.compartmentTypes)}
              className="btn-hover-scale animate-fade-in-up"
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              {/* Mini fridge illustration */}
              <MiniFridge compartmentTypes={template.compartmentTypes} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '15px' }}>
                  {template.icon} {template.name}
                </p>
                <p style={{ fontSize: '12px', color: '#8b8b9e', marginTop: '2px', fontWeight: 500 }}>
                  {template.description}
                </p>
                {/* Compartment preview chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {template.compartmentTypes.map((typeId, chipIdx) => {
                    const info = COMPARTMENT_TYPES[typeId];
                    return (
                      <span
                        key={`${typeId}-${chipIdx}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 600,
                          backgroundColor: info.color + '60',
                          color: '#555',
                        }}
                      >
                        {info.icon} {info.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
