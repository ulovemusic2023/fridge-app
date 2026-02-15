/**
 * AddFoodModal — Premium modal dialog for adding a new food item.
 * Includes AI-powered food recognition via camera and photo upload.
 */

import { useState, useEffect, useRef } from 'react';
import type { FoodCategory, FridgeConfig } from '../types/fridge';
import { FOOD_CATEGORIES, getCompartmentLabel } from '../types/fridge';
import { getDefaultExpiryDate } from '../store/useFridgeStore';
import { recognizeFood, fileToBase64 } from '../services/foodRecognition';
import CameraCapture from './CameraCapture';

interface AddFoodModalProps {
  open: boolean;
  compartment: string | null;
  onSave: (food: {
    name: string;
    category: FoodCategory;
    quantity: number;
    compartment: string;
    dateAdded: string;
    expiryDate: string;
  }) => void;
  onClose: () => void;
  fridgeConfig?: FridgeConfig | null;
}

type RecognitionState = 'idle' | 'recognizing' | 'success' | 'error';

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetime(val: string): string {
  return new Date(val).toISOString();
}

export default function AddFoodModal({ open, compartment, onSave, onClose, fridgeConfig }: AddFoodModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState(1);
  const [dateAdded, setDateAdded] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // AI recognition state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('idle');
  const [recognitionError, setRecognitionError] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track whether expiry was set by AI recognition (to avoid overriding with category effect)
  const [expirySetByAI, setExpirySetByAI] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setCategory('other');
      setQuantity(1);
      const now = new Date().toISOString();
      setDateAdded(toLocalDatetime(now));
      setExpiryDate(toLocalDatetime(getDefaultExpiryDate('other', now)));
      setRecognitionState('idle');
      setRecognitionError('');
      setThumbnail(null);
      setExpirySetByAI(false);
    }
  }, [open]);

  useEffect(() => {
    if (dateAdded && !expirySetByAI) {
      const isoDate = fromLocalDatetime(dateAdded);
      setExpiryDate(toLocalDatetime(getDefaultExpiryDate(category, isoDate)));
    }
  }, [category, dateAdded, expirySetByAI]);

  const handleRecognitionResult = async (base64DataUrl: string) => {
    setCameraOpen(false);
    setRecognitionState('recognizing');
    setRecognitionError('');
    setThumbnail(base64DataUrl);

    try {
      const result = await recognizeFood(base64DataUrl);
      setName(result.name);
      setCategory(result.category);

      // Calculate expiry from AI shelf life
      const now = new Date().toISOString();
      const expiry = new Date(now);
      expiry.setDate(expiry.getDate() + result.estimated_shelf_life_days);
      setDateAdded(toLocalDatetime(now));
      setExpiryDate(toLocalDatetime(expiry.toISOString()));
      setExpirySetByAI(true);

      setRecognitionState('success');
      // Clear success state after a brief flash
      setTimeout(() => {
        setRecognitionState('idle');
      }, 1500);
    } catch (err) {
      console.error('Food recognition failed:', err);
      setRecognitionState('error');
      setRecognitionError('辨識失敗，請手動輸入');
      // Clear error after a while
      setTimeout(() => {
        setRecognitionState('idle');
      }, 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      await handleRecognitionResult(base64);
    } catch {
      setRecognitionState('error');
      setRecognitionError('無法讀取照片');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!open || !compartment) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      quantity: Math.max(1, quantity),
      compartment,
      dateAdded: fromLocalDatetime(dateAdded),
      expiryDate: fromLocalDatetime(expiryDate),
    });
    onClose();
  };

  const isRecognizing = recognitionState === 'recognizing';

  return (
    <>
      {/* Camera overlay */}
      <CameraCapture
        open={cameraOpen}
        onCapture={handleRecognitionResult}
        onClose={() => setCameraOpen(false)}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 modal-overlay" onClick={onClose} />
        <div
          className="relative z-10 animate-fade-in-up"
          style={{
            width: '90%',
            maxWidth: '420px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
            padding: '28px',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
            ＋ 加入食物
          </h2>
          <p style={{ fontSize: '13px', color: '#8b8b9e', marginBottom: '16px', fontWeight: 500 }}>
            放入「{getCompartmentLabel(compartment, fridgeConfig)}」
          </p>

          {/* AI Recognition Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              disabled={isRecognizing}
              className="btn-hover-scale"
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '14px',
                border: 'none',
                background: isRecognizing
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: isRecognizing ? '#9ca3af' : '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isRecognizing ? 'not-allowed' : 'pointer',
                boxShadow: isRecognizing ? 'none' : '0 4px 12px rgba(99,102,241,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              📷 拍照辨識
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecognizing}
              className="btn-hover-scale"
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '14px',
                border: 'none',
                background: isRecognizing
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: isRecognizing ? '#9ca3af' : '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isRecognizing ? 'not-allowed' : 'pointer',
                boxShadow: isRecognizing ? 'none' : '0 4px 12px rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              🖼️ 上傳照片辨識
            </button>
          </div>

          {/* Recognition Status */}
          {recognitionState === 'recognizing' && (
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  marginBottom: '6px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                🔍
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>
                AI 辨識中...
              </p>
            </div>
          )}

          {recognitionState === 'success' && (
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                ✅ 辨識成功！
              </p>
            </div>
          )}

          {recognitionState === 'error' && (
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
                ⚠️ {recognitionError}
              </p>
            </div>
          )}

          {/* Thumbnail preview */}
          {thumbnail && recognitionState !== 'recognizing' && (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={thumbnail}
                alt="food preview"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '2px solid #e5e7eb',
                }}
              />
              <span style={{ fontSize: '12px', color: '#8b8b9e', fontWeight: 500 }}>
                辨識結果已填入，可自行修改
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>
                食物名稱 <span style={{ color: '#f472b6' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例：雞胸肉"
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
                onChange={e => {
                  setCategory(e.target.value as FoodCategory);
                  setExpirySetByAI(false);
                }}
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
                onChange={e => {
                  setDateAdded(e.target.value);
                  setExpirySetByAI(false);
                }}
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
    </>
  );
}
