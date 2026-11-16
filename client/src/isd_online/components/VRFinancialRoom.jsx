/**
 * @file VRFinancialRoom.jsx
 * @description Main 3D WebXR Virtual Reality Room Component (CS 662 Evaluation).
 * Constructs the primary 3D spatial scene using React Three Fiber, Three.js, and WebXR.
 * Features:
 * - WebXR immersive session store (createXRStore) with an "Enter VR" mobile button.
 * - OrbitControls and WASD keyboard navigation for desktop/presentation walkthroughs.
 * - Physically based directional lighting with high-resolution shadow mapping.
 * - Dynamic semi-circular spatial arrangement of 3D ExpensePillars.
 * - Translucent BudgetPlane slicing horizontally through categories.
 * - Autonomous floating 3D AIAdvisorOrb with voice synthesis and predictive analysis.
 * - Raycast-selected spatial TransactionHUD cards.
 * - High-tech cyberpunk aesthetic with infinite grid plane and starry cosmos backdrop.
 */

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { createXRStore, XR } from '@react-three/xr';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import * as THREE from 'three';

import ExpensePillar from './ExpensePillar';
import BudgetPlane from './BudgetPlane';
import TransactionHUD from './TransactionHUD';
import AIAdvisorOrb from './AIAdvisorOrb';

// Instantiate the WebXR store outside the component lifecycle to preserve XR state
const xrStore = createXRStore({
  emulate: false,
});

/**
 * Custom WASD Keyboard & Touch Camera Controller for Desktop & Mobile Free-Roam
 */
function KeyboardCameraController() {
  const { camera } = useThree();
  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 4.0 * delta;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const sideDirection = new THREE.Vector3(-direction.z, 0, direction.x);

    if (keys.current.forward) camera.position.addScaledVector(direction, speed);
    if (keys.current.backward) camera.position.addScaledVector(direction, -speed);
    if (keys.current.left) camera.position.addScaledVector(sideDirection, -speed);
    if (keys.current.right) camera.position.addScaledVector(sideDirection, speed);
  });

  return null;
}

/**
 * Main 3D Room Content rendered inside Canvas
 */
function RoomScene({
  categories = [],
  transactions = [],
  budgetCeiling = 18000,
  selectedCategory,
  onSelectCategory,
  onCloseHUD,
}) {
  const controlsRef = useRef();

  // Normalize spending values to 3D spatial height units
  const maxSpend = useMemo(() => {
    if (!categories.length) return 25000;
    return Math.max(...categories.map((c) => Number(c.amount) || 0), 25000);
  }, [categories]);

  // Height of budget plane in 3D world units (Y)
  const budgetHeight = (budgetCeiling / maxSpend) * 3.2;

  // Compute semi-circular positions for all category pillars
  const pillarLayout = useMemo(() => {
    const count = categories.length;
    if (count === 0) return [];

    const radius = 4.0; // Distance in meters from camera center
    const arcAngle = Math.PI * 0.72; // ~130 degree viewing arc
    const startAngle = -arcAngle / 2;
    const step = count > 1 ? arcAngle / (count - 1) : 0;

    return categories.map((cat, index) => {
      const angle = startAngle + step * index;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius;
      const height = Math.max(0.4, ((Number(cat.amount) || 0) / maxSpend) * 3.2);
      const isOverBudget = (Number(cat.amount) || 0) > (cat.budget || budgetCeiling);

      return {
        category: cat,
        x,
        z,
        height,
        isOverBudget,
      };
    });
  }, [categories, maxSpend, budgetCeiling]);

  // Count categories piercing through budget plane
  const breachCount = pillarLayout.filter((p) => p.isOverBudget).length;

  return (
    <>
      {/* 1. Spatial Lighting & Shadows */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[6, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#38bdf8" distance={15} />

      {/* 2. Starry Celestial Backdrop */}
      <Stars radius={40} depth={50} count={2500} factor={4} saturation={0.8} fade speed={1.2} />

      {/* 3. Infinite Spatial Grid Floor with PBR Reflection */}
      <Grid
        position={[0, 0, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={1}
        cellColor="#1e293b"
        sectionSize={2.5}
        sectionThickness={1.5}
        sectionColor="#38bdf8"
        fadeDistance={20}
        fadeStrength={1.5}
      />

      {/* Dark Floor Shadow Receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      {/* 4. Translucent Budget Plane */}
      <BudgetPlane
        budgetHeight={budgetHeight}
        budgetAmount={budgetCeiling}
        radius={4.8}
        breachCount={breachCount}
      />

      {/* 5. 3D Expense Pillars Arranged in Semi-Circle */}
      {pillarLayout.map((item) => (
        <ExpensePillar
          key={item.category.id || item.category.name}
          category={item.category}
          height={item.height}
          position={[item.x, 0, item.z]}
          isSelected={selectedCategory && selectedCategory.id === item.category.id}
          isOverBudget={item.isOverBudget}
          onSelect={(cat) => onSelectCategory(cat)}
        />
      ))}

      {/* 6. Autonomous Floating AI Advisor Orb */}
      <AIAdvisorOrb
        categories={categories}
        transactions={transactions}
        budgetCeiling={budgetCeiling}
        position={[0, 2.1, -1.5]}
      />

      {/* 7. Interactive 3D Spatial Transaction HUD (When a pillar is active) */}
      {selectedCategory && (
        <TransactionHUD
          category={selectedCategory}
          transactions={transactions}
          position={[0, 2.2, -0.5]}
          onClose={onCloseHUD}
        />
      )}

      {/* 8. Desktop Camera Controls + WASD Keyboard Controller */}
      <KeyboardCameraController />
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.5, -2.5]}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going underneath the floor
        minDistance={1.5}
        maxDistance={12}
        enableDamping={true}
        dampingFactor={0.08}
      />
    </>
  );
}

/**
 * Top-Level VRFinancialRoom Component with Canvas & XR Store Integration
 */
export default function VRFinancialRoom({
  categories = [],
  transactions = [],
  budgetCeiling = 18000,
  onBudgetChange,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isStereoSim, setIsStereoSim] = useState(false);

  // Trigger WebXR immersive session
  const handleEnterVR = () => {
    try {
      xrStore.enterVR();
    } catch (err) {
      console.warn('WebXR enterVR fallback:', err);
      // Toggle mobile stereo split-screen simulation for non-WebXR mobile devices
      setIsStereoSim(!isStereoSim);
    }
  };

  return (
    <div className={`vr-room-container ${isStereoSim ? 'stereo-sim-mode' : ''}`}>
      {/* 1. Top HUD Control Overlay */}
      <div className="vr-top-hud">
        <div className="vr-badge-group">
          <div className="vr-academic-badge">
            <span className="vr-pulse-dot"></span>
            <span>CS 662 • Mobile VR & AI Financial Module</span>
          </div>
          <div className="vr-quick-stats">
            <span>Categories:</span>
            <strong>{categories.length}</strong>
          </div>
        </div>

        <div className="vr-top-actions">
          {/* Mobile WebXR "Enter VR" Button */}
          <button
            className="vr-btn vr-btn-primary"
            onClick={handleEnterVR}
            title="Launch WebXR Mobile VR Mode"
          >
            🥽 <span>Enter VR</span>
          </button>

          {/* Mobile Cardboard Stereo Toggle */}
          <button
            className="vr-btn"
            onClick={() => setIsStereoSim(!isStereoSim)}
            title="Toggle Cardboard / Mobile Split-Screen Mode"
          >
            📱 <span>{isStereoSim ? 'Single View' : 'Cardboard 3D'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Canvas with WebXR Provider */}
      <Canvas
        className="vr-canvas"
        shadows
        camera={{ position: [0, 2.2, 3.2], fov: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <XR store={xrStore}>
          <RoomScene
            categories={categories}
            transactions={transactions}
            budgetCeiling={budgetCeiling}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onCloseHUD={() => setSelectedCategory(null)}
          />
        </XR>
      </Canvas>

      {/* 3. Bottom HUD Control Bar */}
      <div className="vr-bottom-hud">
        <div className="vr-instructions-pill">
          <strong>Controls:</strong> <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to walk
          • Click & drag to rotate • Scroll to zoom • Click/Gaze on any pillar or the AI Orb for real-time insights.
        </div>

        {/* Dynamic Budget Plane Height Slider */}
        <div className="vr-budget-slider-wrap">
          <span className="vr-budget-slider-label">3D Budget Ceiling:</span>
          <input
            type="range"
            min="5000"
            max="35000"
            step="1000"
            value={budgetCeiling}
            onChange={(e) => onBudgetChange && onBudgetChange(Number(e.target.value))}
            className="vr-budget-slider"
          />
          <span className="vr-budget-val">₹{budgetCeiling.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
