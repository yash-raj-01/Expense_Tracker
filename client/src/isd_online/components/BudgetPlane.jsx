/**
 * @file BudgetPlane.jsx
 * @description 3D Translucent Budget Threshold Plane for Spatial Financial Analytics.
 * Renders a horizontal glass-like ceiling across the room at the exact Y-height corresponding
 * to the monthly category budget limit (e.g. ₹18,000).
 * Features:
 * - Visually demarcates the maximum allowed spending threshold in 3D space.
 * - Pillars whose expenditure pierces through this plane trigger over-budget state warnings.
 * - Translucent physical glass material with reflection, edge glow, and depth write.
 * - 3D spatial label indicating the budget ceiling amount in INR (₹).
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { formatINR } from '../utils/aiFinancialEngine';

/**
 * @param {Object} props
 * @param {number} props.budgetHeight Y-axis spatial altitude of the plane (derived from budget INR)
 * @param {number} props.budgetAmount Raw budget threshold amount in INR (₹)
 * @param {number} props.radius Radius of the circular/hexagonal semi-circle plane
 * @param {number} props.breachCount Number of categories currently breaching the ceiling
 */
export default function BudgetPlane({
  budgetHeight = 2.4,
  budgetAmount = 18000,
  radius = 5.2,
  breachCount = 0,
}) {
  const planeRef = useRef();
  const wireRef = useRef();
  const targetY = useRef(budgetHeight);

  // Smoothly lerp height when budget limit is adjusted dynamically
  useFrame((state, delta) => {
    targetY.current = THREE.MathUtils.damp(
      targetY.current,
      budgetHeight,
      3.5,
      delta
    );

    if (planeRef.current) {
      planeRef.current.position.y = targetY.current;
    }

    // Subtle gentle pulsation on the perimeter wireframe ring
    if (wireRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.08 + 0.92;
      wireRef.current.material.opacity = 0.5 * pulse;
    }
  });

  const hasBreaches = breachCount > 0;
  const planeColor = hasBreaches ? '#f43f5e' : '#38bdf8';
  const edgeColor = hasBreaches ? '#ef4444' : '#0284c7';

  return (
    <group ref={planeRef} position={[0, budgetHeight, 0]}>
      {/* 1. Translucent Circular Glass Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial
          color={planeColor}
          transparent
          opacity={0.22}
          roughness={0.12}
          metalness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Concentric Decorative Grid Rings for Spatial Depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[radius * 0.65 - 0.02, radius * 0.65, 64]} />
        <meshBasicMaterial
          color={edgeColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Outer Edge Glowing Perimeter Ring */}
      <mesh ref={wireRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius - 0.04, radius, 64]} />
        <meshBasicMaterial
          color={edgeColor}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Spatial 3D Tag Billboard at the Front Lip of the Plane */}
      <Billboard
        position={[0, 0.28, radius * 0.85]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {/* Background badge plate */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.8, 0.52]} />
          <meshBasicMaterial
            color="#090d16"
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Outer border for badge */}
        <lineSegments position={[0, 0, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.8, 0.52)]} />
          <lineBasicMaterial color={hasBreaches ? '#ef4444' : '#38bdf8'} />
        </lineSegments>

        {/* Budget Limit Text */}
        <Text
          position={[0, 0.08, 0.01]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`BUDGET CEILING: ${formatINR(budgetAmount)}`}
        </Text>

        <Text
          position={[0, -0.11, 0.01]}
          fontSize={0.11}
          color={hasBreaches ? '#fca5a5' : '#7dd3fc'}
          anchorX="center"
          anchorY="middle"
        >
          {hasBreaches
            ? `⚠️ ${breachCount} ${breachCount === 1 ? 'Category Exceeding Limit' : 'Categories Exceeding Limit'}`
            : '✓ All Categories Within Limit'}
        </Text>
      </Billboard>
    </group>
  );
}
