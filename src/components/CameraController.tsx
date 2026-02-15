/**
 * CameraController — Manages camera position and OrbitControls.
 * Supports smooth transitions between default and top-down views.
 */

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControllerProps {
  view: 'default' | 'top';
}

// Camera positions for each view
const VIEWS = {
  default: {
    position: new THREE.Vector3(3, 2, 4),
    target: new THREE.Vector3(0, 0, 0),
  },
  top: {
    position: new THREE.Vector3(0, 6, 0.01), // Slight Z offset to avoid gimbal lock
    target: new THREE.Vector3(0, 0, 0),
  },
};

export default function CameraController({ view }: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const targetView = VIEWS[view];
  const isTransitioning = useRef(false);

  // Trigger transition when view changes
  useEffect(() => {
    isTransitioning.current = true;
  }, [view]);

  useFrame(() => {
    if (!isTransitioning.current || !controlsRef.current) return;

    // Lerp camera position
    camera.position.lerp(targetView.position, 0.05);
    controlsRef.current.target.lerp(targetView.target, 0.05);
    controlsRef.current.update();

    // Check if close enough to stop transitioning
    if (camera.position.distanceTo(targetView.position) < 0.01) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={12}
      // Touch: two-finger rotate
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      enableDamping
      dampingFactor={0.1}
    />
  );
}
