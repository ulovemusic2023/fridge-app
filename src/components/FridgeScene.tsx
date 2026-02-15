/**
 * FridgeScene — Three.js Canvas with lighting, floor, and fridge model.
 * Encapsulates the entire 3D scene.
 */

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import FridgeModel from './FridgeModel';
import CameraController from './CameraController';
import ErrorBoundary from './ErrorBoundary';
import type { FridgeState, FridgeActions } from '../store/useFridgeStore';
import type { FoodItem } from '../types/fridge';
import type { ThreeEvent } from '@react-three/fiber';

interface FridgeSceneProps {
  state: FridgeState;
  actions: FridgeActions;
}

/** Loading indicator shown while 3D scene initializes */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f4f8',
        color: '#6b7280',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧊</div>
      <p style={{ fontSize: '0.875rem' }}>載入 3D 冰箱中...</p>
    </div>
  );
}

export default function FridgeScene({ state, actions }: FridgeSceneProps) {
  const [mounted, setMounted] = useState(false);

  // Delay Canvas mount by one frame to ensure container has dimensions
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleFoodClick = (food: FoodItem, event: ThreeEvent<MouseEvent>) => {
    const nativeEvent = event.nativeEvent;
    actions.openContextMenu(food, nativeEvent.clientX, nativeEvent.clientY);
  };

  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <Canvas
        shadows
        camera={{ position: [3, 2, 4], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, failIfMajorPerformanceCaveat: false }}
        fallback={<LoadingFallback />}
        onCreated={() => {
          console.log('[FridgeScene] Canvas created successfully');
        }}
      >
        <color attach="background" args={['#f0f4f8']} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-near={0.1}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-camera-left={-5}
          shadow-camera-right={5}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />
        <directionalLight position={[0, 3, -5]} intensity={0.2} />
        <ContactShadows
          position={[0, -1.7, 0]}
          opacity={0.4}
          scale={8}
          blur={2}
          far={4}
        />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.72, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>

        <Suspense fallback={null}>
          <FridgeModel
            color={state.fridgeColor}
            style={state.style}
            openDoors={state.openDoors}
            onDoorClick={actions.toggleDoor}
            foods={state.foods}
            onFoodClick={handleFoodClick}
            compartments={state.fridgeConfig?.compartments}
          />
        </Suspense>

        <CameraController view={state.cameraView} />
      </Canvas>
    </ErrorBoundary>
  );
}
