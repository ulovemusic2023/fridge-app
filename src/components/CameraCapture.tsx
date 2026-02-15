/**
 * CameraCapture — Full-screen camera overlay for capturing food photos.
 * Uses rear camera (environment facing mode) on mobile.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  open: boolean;
  onCapture: (base64DataUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ open, onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setCaptured(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError('相機無法使用，請確認權限或改用上傳照片');
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setCaptured(null);
      setError(null);
    }
    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCaptured(null);
    startCamera();
  };

  const handleUse = () => {
    if (captured) {
      onCapture(captured);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCaptured(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: '#000' }}
    >
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          background: 'rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={handleClose}
          style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ✕ 關閉
        </button>
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
          📷 拍照辨識食物
        </span>
        <div style={{ width: '60px' }} />
      </div>

      {/* Camera / Preview area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {error ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷❌</div>
            <p style={{ color: '#ff6b6b', fontSize: '16px', fontWeight: 600, lineHeight: 1.6 }}>
              {error}
            </p>
            <button
              onClick={handleClose}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                borderRadius: '14px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              返回
            </button>
          </div>
        ) : captured ? (
          <img
            src={captured}
            alt="captured"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {!cameraReady && !error && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                  📷 開啟相機中...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '20px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          background: 'rgba(0,0,0,0.6)',
        }}
      >
        {captured ? (
          <>
            <button
              onClick={handleRetake}
              style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🔄 重拍
            </button>
            <button
              onClick={handleUse}
              style={{
                padding: '12px 28px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ✅ 使用這張
            </button>
          </>
        ) : !error ? (
          <button
            onClick={handleCapture}
            disabled={!cameraReady}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.8)',
              background: cameraReady
                ? 'radial-gradient(circle, #fff 60%, rgba(255,255,255,0.6) 100%)'
                : 'rgba(255,255,255,0.2)',
              cursor: cameraReady ? 'pointer' : 'not-allowed',
              boxShadow: cameraReady ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
