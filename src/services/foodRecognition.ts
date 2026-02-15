/**
 * Food Recognition Service
 * 
 * ⚠️ AI recognition is DISABLED in frontend-only mode.
 * Requires a backend proxy to safely handle API keys.
 * This file provides the interface + image utilities for when backend is ready.
 */

import type { FoodCategory } from '../types/fridge';
import { MAX_IMAGE_WIDTH } from '../config';

export interface FoodRecognitionResult {
  name: string;
  category: FoodCategory;
  estimated_shelf_life_days: number;
}

/**
 * Resize an image (as base64 data URL) to max width, returning a new base64 data URL.
 */
export function resizeImage(base64DataUrl: string, maxWidth: number = MAX_IMAGE_WIDTH): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64DataUrl;
  });
}

/**
 * Convert a File to base64 data URL.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Recognize food from an image.
 * Currently disabled — needs backend proxy for API key safety.
 * Throws an error explaining the limitation.
 */
export async function recognizeFood(_base64DataUrl: string): Promise<FoodRecognitionResult> {
  throw new Error('AI 食物辨識功能需要後端服務支援，目前版本請手動輸入食物資訊。');
}
