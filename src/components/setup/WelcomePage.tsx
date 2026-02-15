/**
 * WelcomePage — Beautiful welcome screen with fridge illustration.
 * Three options: take photo, upload photo, choose template.
 */

import { useRef, useState, useCallback } from 'react';

interface WelcomePageProps {
  onTakePhoto: (photoDataUrl: string) => void;
  onUploadPhoto: (photoDataUrl: string) => void;
  onChooseTemplate: () => void;
}

/** Inline SVG fridge illustration */
function FridgeIllustration() {
  return (
    <div className="animate-float" style={{ position: 'relative', width: '120px', height: '160px', margin: '0 auto' }}>
      {/* Fridge body */}
      <div style={{
        position: 'absolute',
        inset: '10px 15px 0',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #a5d8ff 0%, #74c0fc 40%, #4dabf7 100%)',
        boxShadow: '0 8px 32px rgba(74,192,247,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
      }}>
        {/* Highlight */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '8%',
          width: '35%',
          height: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
        }} />
        {/* Handle */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '30%',
          width: '5px',
          height: '20px',
          borderRadius: '3px',
          background: 'linear-gradient(180deg, #dee2e6 0%, #adb5bd 50%, #dee2e6 100%)',
          boxShadow: '1px 0 2px rgba(0,0,0,0.1)',
        }} />
        {/* Gap line */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          right: '5%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, transparent)',
          borderRadius: '1px',
        }} />
        {/* Handle bottom */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '60%',
          width: '5px',
          height: '16px',
          borderRadius: '3px',
          background: 'linear-gradient(180deg, #dee2e6 0%, #adb5bd 50%, #dee2e6 100%)',
          boxShadow: '1px 0 2px rgba(0,0,0,0.1)',
        }} />
        {/* Reflection */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 38%, rgba(255,255,255,0.08) 42%, transparent 45%)',
        }} />
      </div>
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        bottom: '-4px',
        left: '20%',
        right: '20%',
        height: '8px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
      }} />
      {/* Sparkle decorations */}
      <div style={{ position: 'absolute', top: '0', right: '5px', fontSize: '14px' }} className="animate-sparkle">✨</div>
      <div style={{ position: 'absolute', bottom: '20px', left: '5px', fontSize: '12px', animationDelay: '1s' }} className="animate-sparkle">⭐</div>
    </div>
  );
}

export default function WelcomePage({ onTakePhoto, onUploadPhoto, onChooseTemplate }: WelcomePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '無法開啟相機';
      setCameraError(message);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    onTakePhoto(dataUrl);
  }, [stopCamera, onTakePhoto]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [onUploadPhoto]);

  // Camera view
  if (cameraActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '24px',
                margin: '16px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}>
                <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>❌ {cameraError}</p>
                <button
                  onClick={stopCamera}
                  className="btn-hover-scale"
                  style={{
                    padding: '8px 20px',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  返回
                </button>
              </div>
            </div>
          )}
        </div>
        {!cameraError && (
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}>
            <button
              onClick={stopCamera}
              className="btn-hover-scale"
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '14px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={capturePhoto}
              className="btn-hover-scale"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      {/* Title with illustration */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-fade-in-up">
        <FridgeIllustration />
        <h2 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#1f2937',
          marginTop: '20px',
          letterSpacing: '-0.02em',
        }}>
          冰箱管家
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#8b8b9e',
          marginTop: '6px',
          fontWeight: 500,
        }}>
          智慧冰箱管理助手
        </p>
      </div>

      {/* Three option cards */}
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          {
            icon: '📷',
            title: '拍照建立冰箱',
            desc: '開啟相機拍攝冰箱照片',
            action: startCamera,
            gradient: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
          },
          {
            icon: '🖼️',
            title: '上傳冰箱照片',
            desc: '從相簿選擇冰箱照片',
            action: () => fileInputRef.current?.click(),
            gradient: 'linear-gradient(135deg, #fce7f3, #ede9fe)',
          },
          {
            icon: '📋',
            title: '選擇內建冰箱',
            desc: '從常見型號快速建立',
            action: onChooseTemplate,
            gradient: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
          },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="btn-hover-scale animate-fade-in-up"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '18px 20px',
              background: item.gradient,
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              textAlign: 'left',
              animationDelay: `${idx * 0.1}s`,
            }}
          >
            <span style={{
              fontSize: '28px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.6)',
              flexShrink: 0,
            }}>
              {item.icon}
            </span>
            <div>
              <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '15px' }}>{item.title}</p>
              <p style={{ fontSize: '12px', color: '#8b8b9e', marginTop: '2px', fontWeight: 500 }}>{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
