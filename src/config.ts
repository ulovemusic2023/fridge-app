// App configuration constants
// ⚠️ NO API KEYS IN FRONTEND CODE
// AI food recognition requires a backend proxy (planned for V2)

export const OPENROUTER_API_URL = '';  // Disabled — needs backend
export const VISION_MODEL = 'anthropic/claude-sonnet-4';
export const VISION_MODEL_FALLBACK = 'openai/gpt-4o-mini';

/** Max image width before sending to API (pixels) */
export const MAX_IMAGE_WIDTH = 800;

/** API call timeout in milliseconds */
export const API_TIMEOUT_MS = 15000;
