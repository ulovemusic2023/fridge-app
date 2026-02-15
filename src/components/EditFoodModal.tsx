/**
 * EditFoodModal — Premium modal dialog for editing an existing food item.
 */

import { useState, useEffect } from 'react';
import type { FoodItem, FoodCategory, FridgeConfig } from '../types/fridge';
import { FOOD_CATEGORIES, getCompartmentLabel } from '../types/fridge';

interface EditFoodModalProps {
  open: boolean;
  food: FoodItem | null;
  onSave: (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => void;
  onClose: () => void;
  fridgeConfig?: FridgeConfig | null;
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetime(val: string): string {
  return new Date(val).toISOString();
}

export default function EditFoodModal({ open, food, onSave, onClose, fridgeConfig }: EditFoodModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState(1);
  const [dateAdded, setDateAdded] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (open && food) {
      setName(food.name);
      setCategory(food.category);
      setQuantity(food.quantity);
      setDateAdded(toLocalDatetime(food.dateAdded));
      setExpiryDate(toLocalDatetime(food.expiryDate));
    }
  }, [open, food]);

  if (!open || !food) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(food.id, {
      name: name.trim(),
      category,
      quantity: Math.max(1, quantity),
      dateAdded: fromLocalDatetime(dateAdded),
      expiryDate: fromLocalDatetime(expiryDate),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div
        className="relative z-10 animate-fade-in-up"
        style={{
          width: '90%',
          maxWidth: '420px',
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          padding: '28px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
          ✏️ 修改食物
        </h2>
        <p style={{ fontSize: '13px', color: '#8b8b9e', marginBottom: '20px', fontWeight: 500 }}>
          位於「{getCompartmentLabel(food.compartment, fridgeConfig)}」
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>
              食物名稱 <span style={{ color: '#f472b6' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 500,
                background: 'rgba(255,255,255,0.8)',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>分類</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as FoodCategory)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 500,
                background: 'rgba(255,255,255,0.8)',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {FOOD_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>數量</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="btn-hover-scale"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: '#faf8ff',
                  color: '#6366f1',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '60px',
                  textAlign: 'center',
                  padding: '8px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="btn-hover-scale"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: '#faf8ff',
                  color: '#6366f1',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ＋
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>放入日期</label>
            <input
              type="datetime-local"
              value={dateAdded}
              onChange={e => setDateAdded(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>到期日期</label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            className="btn-hover-scale"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '14px',
              border: 'none',
              background: 'rgba(0,0,0,0.04)',
              color: '#6b7280',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-hover-scale"
            style={{
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '14px',
              border: 'none',
              background: !name.trim() ? '#d1d5db' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
              boxShadow: name.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              opacity: !name.trim() ? 0.5 : 1,
            }}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}
