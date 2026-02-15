/**
 * FoodItems3D — Renders food items as colored blocks inside open compartments.
 */

import { RoundedBox, Text } from '@react-three/drei';
import type { FoodItem } from '../types/fridge';
import { getCategoryInfo } from '../types/fridge';
import type { ThreeEvent } from '@react-three/fiber';

interface FoodItems3DProps {
  foods: FoodItem[];
  compartment: string;
  compartmentY: number;
  compartmentHeight: number;
  bodyWidth: number;
  bodyDepth: number;
  onFoodClick: (food: FoodItem, event: ThreeEvent<MouseEvent>) => void;
}

const BLOCK_SIZE = 0.25;
const BLOCK_GAP = 0.08;

export default function FoodItems3D({
  foods,
  compartment,
  compartmentY,
  compartmentHeight,
  bodyWidth,
  bodyDepth,
  onFoodClick,
}: FoodItems3DProps) {
  if (foods.length === 0) return null;

  // Suppress unused lint
  void compartment;

  const usableW = bodyWidth - 0.4;
  const usableD = bodyDepth - 0.4;
  const cols = Math.max(1, Math.floor(usableW / (BLOCK_SIZE + BLOCK_GAP)));
  const rows = Math.max(1, Math.floor(usableD / (BLOCK_SIZE + BLOCK_GAP)));
  const maxPerLayer = cols * rows;

  const baseY = compartmentY - compartmentHeight / 2 + BLOCK_SIZE / 2 + 0.06;

  return (
    <group>
      {foods.map((food, idx) => {
        const layer = Math.floor(idx / maxPerLayer);
        const posInLayer = idx % maxPerLayer;
        const col = posInLayer % cols;
        const row = Math.floor(posInLayer / cols) % rows;

        const startX = -(cols - 1) * (BLOCK_SIZE + BLOCK_GAP) / 2;
        const startZ = -(rows - 1) * (BLOCK_SIZE + BLOCK_GAP) / 2;
        const x = startX + col * (BLOCK_SIZE + BLOCK_GAP);
        const z = startZ + row * (BLOCK_SIZE + BLOCK_GAP);
        const y = baseY + layer * (BLOCK_SIZE + BLOCK_GAP);

        const catInfo = getCategoryInfo(food.category);
        const blockColor = catInfo.color;

        const now = Date.now();
        const expiryTime = new Date(food.expiryDate).getTime();
        const daysLeft = (expiryTime - now) / (1000 * 60 * 60 * 24);
        let emissiveColor = '#000000';
        if (daysLeft <= 0) emissiveColor = '#333333';
        else if (daysLeft <= 1) emissiveColor = '#ff0000';
        else if (daysLeft <= 3) emissiveColor = '#ffaa00';

        const displayName = food.name.length > 3 ? food.name.slice(0, 3) + '..' : food.name;

        return (
          <group key={food.id} position={[x, y, z]}>
            <RoundedBox
              args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]}
              radius={0.03}
              smoothness={2}
              castShadow
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onFoodClick(food, e);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <meshStandardMaterial
                color={blockColor}
                roughness={0.5}
                metalness={0.1}
                emissive={emissiveColor}
                emissiveIntensity={daysLeft <= 0 ? 0.3 : daysLeft <= 3 ? 0.15 : 0}
              />
            </RoundedBox>
            <Text
              position={[0, BLOCK_SIZE / 2 + 0.02, 0]}
              rotation={[-Math.PI / 4, 0, 0]}
              fontSize={0.07}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.008}
              outlineColor="#000000"
            >
              {displayName}
            </Text>
            {food.quantity > 1 && (
              <Text
                position={[BLOCK_SIZE / 2 - 0.02, BLOCK_SIZE / 2 - 0.02, BLOCK_SIZE / 2 + 0.01]}
                fontSize={0.06}
                color="#ffffff"
                anchorX="right"
                anchorY="top"
                outlineWidth={0.006}
                outlineColor="#000000"
              >
                {`×${food.quantity}`}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
