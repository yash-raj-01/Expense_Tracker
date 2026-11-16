/**
 * @file AIAdvisorOrb.jsx
 * @description 3D Animated AI Financial Advisor Sphere for WebXR & Mobile VR.
 * Represents an autonomous, spatial AI agent within the virtual room that:
 * 1. Levitates and animates with a sinusoidal hovering motion and rotating orbital rings.
 * 2. Emits dynamic spatial point lighting onto nearby geometry.
 * 3. Triggers predictive spending & anomaly heuristics on click or WebXR controller gaze.
 * 4. Displays an interactive 3D spatial glass card summarizing burn rate, risk, and insights.
 * 5. Uses Web Speech API (speechSynthesis) to speak the financial assessment aloud.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { formatINR, analyzeFinancialHealth } from '../utils/aiFinancialEngine';
import { speechController } from '../utils/speechSynthesis';

/**
 * @param {Object} props
 * @param {Array} props.categories Categories data
 * @param {Array} props.transactions Transactions data
 * @param {number} props.budgetCeiling Budget ceiling limit
 * @param {Array<number>} props.position 3D position [x, y, z]
 */
export default function AIAdvisorOrb({
  categories = [],
  transactions = [],
  budgetCeiling = 18000,
  position = [0, 2.2, -1.2],
}) {
  const orbRef = useRef();
  const auraRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const lightRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [report, setReport] = useState(null);

  // Subscribe to speech synthesis status
  useEffect(() => {
    const unsubscribe = speechController.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
      speechController.stop();
    };
  }, []);

  // Compute fresh report whenever categories, transactions, or budget ceiling changes
  useEffect(() => {
    const analysis = analyzeFinancialHealth(categories, transactions, budgetCeiling);
    setReport(analysis);
  }, [categories, transactions, budgetCeiling]);

  // Frame-by-frame 3D transformation and pulsing animation
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Sinusoidal floating levitation
    const hoverY = Math.sin(time * 1.8) * 0.12;
    if (orbRef.current) {
      orbRef.current.position.y = position[1] + hoverY;
      orbRef.current.rotation.y += delta * 0.4;
    }

    // Outer wireframe pulsating energy aura
    if (auraRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.08;
      auraRef.current.scale.set(pulse, pulse, pulse);
      auraRef.current.rotation.x += delta * 0.25;
      auraRef.current.rotation.z += delta * 0.35;
    }

    // Rotating gyroscopic orbital rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.8;
      ring1Ref.current.rotation.y = time * 0.6;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.7;
      ring2Ref.current.rotation.z = time * 0.5;
    }

    // Point light intensity modulation
    if (lightRef.current) {
      lightRef.current.intensity = isSpeaking
        ? 3.5 + Math.sin(time * 10) * 1.5
        : hovered
        ? 3.0
        : 1.8 + Math.sin(time * 2) * 0.4;
    }
  });

  // Handle raycast click/gaze interaction
  const handleTrigger = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && report) {
      speechController.speak(report.speechScript);
    } else {
      speechController.stop();
    }
  };

  const handleReplay = (e) => {
    if (e) e.stopPropagation();
    if (report) {
      speechController.speak(report.speechScript);
    }
  };

  const handleToggleMute = (e) => {
    if (e) e.stopPropagation();
    const muted = speechController.toggleMute();
    setIsMuted(muted);
  };

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 1. Main Floating AI Core Group */}
      <group
        ref={orbRef}
        position={[0, position[1], 0]}
        onClick={handleTrigger}
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
        {/* Core Glowing Sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.38, 48, 48]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#a855f7"
            emissiveIntensity={isSpeaking ? 2.5 : hovered ? 2.0 : 1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Outer Icosahedron Wireframe Energy Aura */}
        <mesh ref={auraRef}>
          <icosahedronGeometry args={[0.52, 1]} />
          <meshBasicMaterial
            color={isSpeaking ? '#38bdf8' : '#c084fc'}
            wireframe
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* Gyroscopic Orbital Rings */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.62, 0.015, 16, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        <mesh ref={ring2Ref}>
          <torusGeometry args={[0.72, 0.015, 16, 64]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Spatial Omni Point Light casting colored radiance */}
        <pointLight
          ref={lightRef}
          color={isSpeaking ? '#38bdf8' : '#a855f7'}
          intensity={2.2}
          distance={8}
          decay={2}
        />

        {/* Floating 3D Title Badge Above Orb */}
        <Billboard position={[0, 0.85, 0]} follow={true}>
          <Text
            fontSize={0.16}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#3b0764"
          >
            🤖 AI FINANCIAL ADVISOR
          </Text>
          <Text
            position={[0, -0.18, 0]}
            fontSize={0.11}
            color={isSpeaking ? '#38bdf8' : '#c084fc'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#090d16"
          >
            {isSpeaking ? '🗣️ Speaking Insights...' : hovered ? '👆 Click to Analyze' : '✨ Gaze / Click to Consult'}
          </Text>
        </Billboard>
      </group>

      {/* 2. Spatial 3D AI Advisor Insights Panel (Rendered on Trigger) */}
      {isOpen && report && (
        <group position={[0, position[1] + 0.1, 0.8]}>
          <Html
            center
            distanceFactor={6.5}
            transform
            style={{
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
          >
            <div className="vr-ai-card">
              {/* Card Header */}
              <div className="vr-ai-header">
                <div className="vr-ai-title-wrap">
                  <div className="vr-ai-avatar">🤖</div>
                  <div>
                    <h3 className="vr-ai-title">AI Portfolio Intelligence</h3>
                    <span className="vr-ai-badge">CS 662 Autonomous Heuristic</span>
                  </div>
                </div>
                <button
                  className="vr-hud-close-btn"
                  onClick={() => {
                    setIsOpen(false);
                    speechController.stop();
                  }}
                  title="Close AI Panel"
                  aria-label="Close AI Panel"
                >
                  ✕
                </button>
              </div>

              {/* Card Metrics Body */}
              <div className="vr-ai-body">
                {/* Score & Burn Rate */}
                <div className="vr-ai-score-row">
                  <div>
                    <div className="vr-ai-score-label">Financial Stability Index</div>
                    <div className="vr-ai-score-val">{report.healthScore} / 100</div>
                  </div>
                  <div>
                    <div className="vr-ai-score-label">Projected Month-End</div>
                    <div className="vr-ai-score-val" style={{ color: '#a855f7' }}>
                      {formatINR(report.burnRateForecast)}
                    </div>
                  </div>
                </div>

                {/* Highest Category Metric */}
                {report.highestCategory && (
                  <div className="vr-ai-rec-box">
                    <strong>Primary Outflow:</strong> {report.highestCategory.name || report.highestCategory.category} (
                    {formatINR(report.highestCategory.amount)}, {report.highestSpendPercent}% of portfolio).
                  </div>
                )}

                {/* Key Recommendations */}
                {report.recommendations && report.recommendations.length > 0 && (
                  <div className="vr-ai-rec-box" style={{ borderLeftColor: '#38bdf8' }}>
                    <strong>Actionable Insight:</strong> {report.recommendations[0]}
                  </div>
                )}

                {/* Speech Activity Status */}
                <div className="vr-ai-audio-status">
                  {isSpeaking ? (
                    <>
                      <div className="vr-ai-waveform">
                        <div className="vr-ai-wave-bar"></div>
                        <div className="vr-ai-wave-bar"></div>
                        <div className="vr-ai-wave-bar"></div>
                      </div>
                      <span>Synthesizing voice briefing...</span>
                    </>
                  ) : (
                    <span>Voice briefing idle.</span>
                  )}
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="vr-ai-footer">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="vr-btn vr-btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={handleReplay}
                  >
                    🔄 Replay Voice
                  </button>
                  <button
                    className="vr-btn"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={handleToggleMute}
                  >
                    {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                  </button>
                </div>
                <button
                  className="vr-hud-done-btn"
                  onClick={() => {
                    setIsOpen(false);
                    speechController.stop();
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
