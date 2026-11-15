/**
 * @file ExpensePillar.jsx
 * @description 3D Spatial Financial Pillar Component for WebXR & Mobile VR.
 * Represents an individual expense category as a 3D cylindrical pillar in virtual space.
 * Features:
 * - Dynamic height scaling proportional to spending amount.
 * - Smooth frame-by-frame spring/lerp interpolation on mount & updates.
 * - Physically Based Rendering (PBR) meshStandardMaterial with roughness, metalness, and emissive hover glow.
 * - Warning shader color shift if category exceeds budget threshold.
 * - Floating 3D Drei <Text> label displaying category name and formatted Indian Rupee (₹) amount.
 * - Pointer / Gaze interactive raycasting with hover feedback and click selection.
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { formatINR } from '../utils/aiFinancialEngine';

/**
 * @param {Object} props
 * @param {Object} props.category Category data { id, name, amount, color, icon, budget }
 * @param {number} props.height Target pillar height in 3D world units (Y axis)
 * @param {Array<number>} props.position 3D spatial position [x, y, z]
 * @param {boolean} props.isSelected Whether this pillar is currently focused/selected in HUD
 * @param {boolean} props.isOverBudget Whether category spend exceeds the budget plane ceiling
 * @param {Function} props.onSelect Selection callback triggered by raycast click/gaze
 */
export default function ExpensePillar({
  category,
  height = 2.0,
  position = [0, 0, 0],
  isSelected = false,
  isOverBudget = false,
  onSelect,
}) {
  const meshRef = useRef();
  const capRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Target values for smooth animation
  const targetHeight = Math.max(0.4, Number(height) || 0.4);
  const currentHeight = useRef(0.1);

  // Frame-by-frame lerp animation for smooth spring-like growth on load and update
  useFrame((state, delta) => {
    // Smoothly interpolate current height toward target height
    currentHeight.current = THREE.MathUtils.damp(
      currentHeight.current,
      targetHeight,
      4.5,
      delta
    );

    if (meshRef.current) {
      // Scale along Y axis; maintain cylinder unit radius 0.35
      meshRef.current.scale.set(
        hovered || isSelected ? 1.08 : 1.0,
        currentHeight.current,
        hovered || isSelected ? 1.08 : 1.0
      );
      // Pivot cylinder at floor: center is height / 2
      meshRef.current.position.y = currentHeight.current / 2;
    }

    // Keep top cap disc synchronized with top of the pillar
    if (capRef.current) {
      capRef.current.position.y = currentHeight.current + 0.02;
    }

    // Pulse base ring if selected or over-budget
    if (ringRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.05 + 1;
      ringRef.current.scale.set(pulse, 1, pulse);
    }
  });

  // Color scheme: Warning crimson for budget breach, primary category color otherwise
  const baseColor = category.color || '#3b82f6';
  const displayColor = isOverBudget ? '#ef4444' : baseColor;
  const emissiveColor = isOverBudget
    ? '#dc2626'
    : hovered || isSelected
    ? baseColor
    : '#000000';
  const emissiveIntensity = hovered || isSelected ? 0.75 : isOverBudget ? 0.45 : 0.05;

  return (
    <group position={position}>
      {/* 1. Base Anchor Glow Ring on Grid Floor */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[0.38, 0.46, 32]} />
        <meshBasicMaterial
          color={isOverBudget ? '#ef4444' : isSelected ? '#38bdf8' : displayColor}
          transparent
          opacity={hovered || isSelected ? 0.9 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Main Cylindrical Pillar (PBR Standard Material) */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(category);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {/* Unit cylinder with radiusTop=0.32, radiusBottom=0.34, height=1, radialSegments=32 */}
        <cylinderGeometry args={[0.32, 0.34, 1, 32]} />
        <meshStandardMaterial
          color={displayColor}
          roughness={0.25}
          metalness={0.65}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* 3. Pillar Top Cap Disc with Metallic Trim */}
      <mesh ref={capRef} position={[0, targetHeight + 0.02, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.04, 32]} />
        <meshStandardMaterial
          color={isOverBudget ? '#f87171' : '#ffffff'}
          roughness={0.15}
          metalness={0.85}
          emissive={isOverBudget ? '#ef4444' : displayColor}
          emissiveIntensity={isOverBudget ? 0.8 : 0.3}
        />
      </mesh>

      {/* 4. Floating 3D Text Label (Category & Amount) */}
      <Billboard
        position={[0, targetHeight + 0.45, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {/* Category Icon & Title */}
        <Text
          position={[0, 0.22, 0]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#0f172a"
        >
          {`${category.icon || '📊'} ${category.name || category.category}`}
        </Text>

        {/* Currency Amount in Indian Rupees (₹) */}
        <Text
          position={[0, 0.02, 0]}
          fontSize={0.21}
          color={isOverBudget ? '#fca5a5' : '#38bdf8'}
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#090d16"
        >
          {formatINR(category.amount)}
        </Text>

        {/* Over-budget warning badge */}
        {isOverBudget && (
          <Text
            position={[0, -0.16, 0]}
            fontSize={0.12}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#450a0a"
          >
            ⚠️ OVER BUDGET
          </Text>
        )}
      </Billboard>
    </group>
  );
}
