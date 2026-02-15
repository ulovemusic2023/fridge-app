/**
 * FridgeModel — 3D cartoon fridge built with Three.js primitives.
 * 
 * Dynamically renders compartments based on configuration.
 * Each door is clickable and animates open/close.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { FridgeStyle, FoodItem, CompartmentInstance } from '../types/fridge';
import { COMPARTMENT_TYPES } from '../types/fridge';
import FoodItems3D from './FoodItems3D';
import type { ThreeEvent } from '@react-three/fiber';

interface FridgeModelProps {
  color: string;
  style: FridgeStyle;
  openDoors: Record<string, boolean>;
  onDoorClick: (compartment: string) => void;
  foods: FoodItem[];
  onFoodClick: (food: FoodItem, event: ThreeEvent<MouseEvent>) => void;
  compartments?: CompartmentInstance[];
}

// Fridge dimensions
const BODY_W = 2.0;
const BODY_D = 1.6;
const DOOR_THICKNESS = 0.08;
const GAP = 0.02;
const MIN_COMPARTMENT_H = 0.5;

// Default compartments (fallback if none provided)
const DEFAULT_COMPARTMENTS: CompartmentInstance[] = [
  { id: 'refrigerator-1', typeId: 'refrigerator' },
  { id: 'freezer-1', typeId: 'freezer' },
  { id: 'vegetable-1', typeId: 'vegetable' },
];

/**
 * Calculate compartment heights based on type.
 * Taller compartments for refrigerator, smaller for drawers.
 */
function getCompartmentWeight(typeId: string): number {
  switch (typeId) {
    case 'refrigerator': return 1.4;
    case 'freezer': return 1.0;
    case 'vegetable': return 0.8;
    case 'quickFreeze': return 0.8;
    case 'variableTemp': return 0.7;
    case 'iceMaker': return 0.5;
    case 'softFreeze': return 0.7;
    case 'vacuum': return 0.7;
    case 'chilled': return 0.6;
    default: return 0.8;
  }
}

/** Types that use drawer-style (slide out) instead of swing door */
function isDrawerType(typeId: string): boolean {
  return ['vegetable', 'iceMaker', 'chilled'].includes(typeId);
}

function getRadius(style: FridgeStyle): number {
  switch (style) {
    case 'retro': return 0.02;
    case 'modern': return 0.06;
    case 'cute': return 0.18;
  }
}

/**
 * Individual compartment door with open/close animation.
 */
function CompartmentDoor({
  instanceId,
  typeId,
  width,
  height,
  depth,
  positionY,
  isOpen,
  onClick,
  color,
  style,
  label,
}: {
  instanceId: string;
  typeId: string;
  width: number;
  height: number;
  depth: number;
  positionY: number;
  isOpen: boolean;
  onClick: () => void;
  color: string;
  style: FridgeStyle;
  label: string;
}) {
  const isDrawer = isDrawerType(typeId);
  const pivotRef = useRef<THREE.Group>(null);
  const targetAngle = isOpen ? (isDrawer ? 0 : -Math.PI / 3) : 0;
  const targetSlide = isOpen && isDrawer ? 0.8 : 0;
  
  const radius = getRadius(style);
  
  const doorColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, -0.05, 0.05);
    return '#' + c.getHexString();
  }, [color]);

  const handleColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, 0, -0.2);
    return '#' + c.getHexString();
  }, [color]);

  useFrame(() => {
    if (!pivotRef.current) return;
    if (isDrawer) {
      pivotRef.current.position.z = THREE.MathUtils.lerp(
        pivotRef.current.position.z,
        targetSlide,
        0.08
      );
    } else {
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        pivotRef.current.rotation.y,
        targetAngle,
        0.08
      );
    }
  });

  // Suppress unused var lint
  void instanceId;

  const halfW = width / 2;

  return (
    <group position={[0, positionY, depth / 2]}>
      <group
        ref={pivotRef}
        position={isDrawer ? [0, 0, 0] : [-halfW, 0, 0]}
      >
        <group
          position={isDrawer ? [0, 0, 0] : [halfW, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <RoundedBox
            args={[width - 0.02, height - GAP, DOOR_THICKNESS]}
            radius={radius}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={doorColor} roughness={0.3} metalness={0.1} />
          </RoundedBox>

          {/* Handle */}
          {isDrawer ? (
            <mesh position={[0, 0, DOOR_THICKNESS / 2 + 0.02]} castShadow>
              <boxGeometry args={[width * 0.4, 0.04, 0.04]} />
              <meshStandardMaterial color={handleColor} roughness={0.2} metalness={0.5} />
            </mesh>
          ) : (
            <mesh position={[width / 2 - 0.15, 0, DOOR_THICKNESS / 2 + 0.02]} castShadow>
              <boxGeometry args={[0.04, height * 0.3, 0.04]} />
              <meshStandardMaterial color={handleColor} roughness={0.2} metalness={0.5} />
            </mesh>
          )}

          {/* Label */}
          <Text
            position={[0, isDrawer ? 0.02 : -height * 0.3, DOOR_THICKNESS / 2 + 0.01]}
            fontSize={0.13}
            color="#666"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>

          {/* Cute style decorations */}
          {style === 'cute' && typeId === 'refrigerator' && (
            <group position={[0, height * 0.2, DOOR_THICKNESS / 2 + 0.01]}>
              <Text fontSize={0.25} anchorX="center" anchorY="middle">
                {'⭐'}
              </Text>
            </group>
          )}
          {style === 'cute' && typeId === 'freezer' && (
            <group position={[0, height * 0.2, DOOR_THICKNESS / 2 + 0.01]}>
              <Text fontSize={0.25} anchorX="center" anchorY="middle">
                {'❄️'}
              </Text>
            </group>
          )}

          {/* Retro style chrome strip */}
          {style === 'retro' && (
            <mesh position={[0, -height / 2 + 0.06, DOOR_THICKNESS / 2 + 0.005]}>
              <boxGeometry args={[width - 0.1, 0.03, 0.01]} />
              <meshStandardMaterial color="#c0c0c0" roughness={0.1} metalness={0.8} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

/**
 * Main fridge body with dynamic compartments
 */
export default function FridgeModel({ color, style, openDoors, onDoorClick, foods, onFoodClick, compartments }: FridgeModelProps) {
  const radius = getRadius(style);
  const interiorColor = '#2a2a2e';
  const comps = compartments && compartments.length > 0 ? compartments : DEFAULT_COMPARTMENTS;

  // Calculate heights dynamically
  const weights = comps.map(c => getCompartmentWeight(c.typeId));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  // Total body height scales with number of compartments
  const BODY_H = Math.max(2.0, Math.min(4.0, totalWeight + 0.2));
  const usableH = BODY_H - 0.1; // padding top/bottom
  const heights = weights.map(w => Math.max(MIN_COMPARTMENT_H, (w / totalWeight) * usableH));

  // Calculate Y positions (top to bottom)
  const topY = BODY_H / 2;
  const compartmentData = comps.map((comp, i) => {
    const h = heights[i];
    let accumulatedH = 0;
    for (let j = 0; j < i; j++) accumulatedH += heights[j];
    const centerY = topY - accumulatedH - h / 2;
    return { comp, height: h, centerY };
  });

  // Shelves between compartments
  const shelfYs: number[] = [];
  {
    let accH = 0;
    for (let i = 0; i < heights.length - 1; i++) {
      accH += heights[i];
      shelfYs.push(topY - accH);
    }
  }

  const legH = 0.15;
  const anyOpen = comps.some(c => openDoors[c.id]);

  return (
    <group position={[0, -BODY_H / 2 + legH, 0]}>
      {/* Fridge body */}
      <RoundedBox
        args={[BODY_W, BODY_H, BODY_D]}
        radius={radius}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </RoundedBox>

      {/* Interior */}
      <RoundedBox
        args={[BODY_W - 0.1, BODY_H - 0.1, BODY_D - 0.1]}
        radius={radius * 0.5}
        smoothness={4}
      >
        <meshStandardMaterial color={interiorColor} roughness={0.8} side={THREE.BackSide} />
      </RoundedBox>

      {/* Shelves between compartments */}
      {shelfYs.map((sy, i) => (
        <mesh key={`shelf-${i}`} position={[0, sy, 0]}>
          <boxGeometry args={[BODY_W - 0.12, 0.04, BODY_D - 0.12]} />
          <meshStandardMaterial color="#d0d0d0" roughness={0.5} />
        </mesh>
      ))}

      {/* Interior light */}
      {anyOpen && (
        <pointLight position={[0, 0.5, 0]} intensity={0.5} distance={3} color="#fff5e0" />
      )}

      {/* Food items inside open compartments */}
      {compartmentData.map(({ comp, height: ch, centerY }) => {
        if (!openDoors[comp.id]) return null;
        const compartmentFoods = foods.filter(f => f.compartment === comp.id);
        if (compartmentFoods.length === 0) return null;
        return (
          <FoodItems3D
            key={comp.id}
            foods={compartmentFoods}
            compartment={comp.id}
            compartmentY={centerY}
            compartmentHeight={ch}
            bodyWidth={BODY_W}
            bodyDepth={BODY_D}
            onFoodClick={onFoodClick}
          />
        );
      })}

      {/* Compartment doors */}
      {compartmentData.map(({ comp, height: ch, centerY }) => {
        const typeInfo = COMPARTMENT_TYPES[comp.typeId];
        return (
          <CompartmentDoor
            key={comp.id}
            instanceId={comp.id}
            typeId={comp.typeId}
            width={BODY_W}
            height={ch}
            depth={BODY_D}
            positionY={centerY}
            isOpen={openDoors[comp.id] ?? false}
            onClick={() => onDoorClick(comp.id)}
            color={color}
            style={style}
            label={typeInfo?.name?.replace('室', '') ?? comp.typeId}
          />
        );
      })}

      {/* Legs */}
      {[[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, -BODY_H / 2 - legH / 2, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, legH, 8]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* Cute style: ears */}
      {style === 'cute' && (
        <>
          <mesh position={[-0.5, BODY_H / 2 + 0.15, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ffb6c1" roughness={0.4} />
          </mesh>
          <mesh position={[0.5, BODY_H / 2 + 0.15, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ffb6c1" roughness={0.4} />
          </mesh>
        </>
      )}

      {/* Retro style: chrome top trim */}
      {style === 'retro' && (
        <mesh position={[0, BODY_H / 2 + 0.025, 0]}>
          <boxGeometry args={[BODY_W + 0.05, 0.05, BODY_D + 0.05]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.1} metalness={0.9} />
        </mesh>
      )}
    </group>
  );
}
