/**
 * @file TransactionHUD.jsx
 * @description Spatial 3D Transaction HUD Component for WebXR & Desktop.
 * Renders an interactive glassmorphic HUD panel anchored in 3D space when a user
 * clicks or gazes upon an ExpensePillar.
 * Features:
 * - Floating spatial billboard that tracks 3D coordinates in front of the camera/pillar.
 * - Displays itemized transactions for the selected category.
 * - Shows transaction details: title, date, payment mode, notes, and amount in ₹.
 * - Interactive dismiss button and category spend summary.
 * - Works seamlessly on mobile touchscreens, desktop mouse pointer, and VR controllers.
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { formatINR } from '../utils/aiFinancialEngine';

/**
 * @param {Object} props
 * @param {Object} props.category Selected category object
 * @param {Array} props.transactions Full transaction list to filter from
 * @param {Array<number>} props.position 3D coordinates [x, y, z] to float the HUD
 * @param {Function} props.onClose Callback when close button is clicked
 */
export default function TransactionHUD({
  category,
  transactions = [],
  position = [0, 2.5, 0],
  onClose,
}) {
  if (!category) return null;

  // Filter transactions belonging to this category
  const categoryTransactions = transactions.filter((tx) => {
    const txCat = (tx.category || '').toLowerCase();
    const catName = (category.name || category.category || '').toLowerCase();
    const catId = (category.id || '').toLowerCase();
    return txCat === catName || txCat === catId || txCat.includes(catName);
  });

  const totalAmount = category.amount || 0;

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={6.5}
        transform
        style={{
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <div className="vr-hud-card">
          {/* HUD Header */}
          <div
            className="vr-hud-header"
            style={{ borderLeftColor: category.color || '#38bdf8' }}
          >
            <div className="vr-hud-title-wrap">
              <span className="vr-hud-icon">{category.icon || '💳'}</span>
              <div>
                <h3 className="vr-hud-title">{category.name || category.category}</h3>
                <p className="vr-hud-subtitle">
                  {categoryTransactions.length}{' '}
                  {categoryTransactions.length === 1 ? 'Transaction' : 'Transactions'} • Total:{' '}
                  <strong>{formatINR(totalAmount)}</strong>
                </p>
              </div>
            </div>
            <button
              className="vr-hud-close-btn"
              onClick={onClose}
              title="Close HUD"
              aria-label="Close HUD"
            >
              ✕
            </button>
          </div>

          {/* Transaction Item List */}
          <div className="vr-hud-body">
            {categoryTransactions.length === 0 ? (
              <div className="vr-hud-empty">
                <p>No recent itemized transactions for this category.</p>
                <small>Overall category aggregate: {formatINR(totalAmount)}</small>
              </div>
            ) : (
              <div className="vr-hud-list">
                {categoryTransactions.map((tx) => (
                  <div key={tx.id || `${tx.title}-${tx.date}`} className="vr-hud-item">
                    <div className="vr-hud-item-left">
                      <div className="vr-hud-item-title">{tx.title || tx.description || 'Expense'}</div>
                      <div className="vr-hud-item-meta">
                        <span>📅 {tx.date || 'Recent'}</span>
                        {tx.paymentMode && <span>• 💳 {tx.paymentMode}</span>}
                      </div>
                      {tx.notes && <div className="vr-hud-item-notes">{tx.notes}</div>}
                    </div>
                    <div className="vr-hud-item-amount">
                      -{formatINR(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HUD Footer Action */}
          <div className="vr-hud-footer">
            <span className="vr-hud-hint">💡 Gaze or click anywhere outside to dismiss</span>
            <button className="vr-hud-done-btn" onClick={onClose}>
              Done Viewing
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
