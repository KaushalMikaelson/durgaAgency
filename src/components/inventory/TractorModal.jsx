// Tractor Stock & Chassis Management Modal
import React, { useState } from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';

export function TractorModal({ tractor, onClose }) {
  const { updateTractorStock } = useDealership();

  const [stockDelta, setStockDelta] = useState(1);
  const [newChassis, setNewChassis] = useState('');

  if (!tractor) return null;

  const handleStockUpdate = (delta) => {
    updateTractorStock(tractor.id, delta, newChassis.trim() || null);
    setNewChassis('');
    onClose();
  };

  return (
    <div className="tractor-modal-content">
      <div className="tractor-header-info">
        <h4>{tractor.brand} {tractor.model} ({tractor.hp} HP)</h4>
        <p>Current Inventory: <strong>{tractor.stockCount || 0} Units</strong> ({tractor.status})</p>
      </div>

      <div className="form-group">
        <label>Add New Chassis Number (Optional for New Received Unit)</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. CH-4511-4WD-9821"
          value={newChassis}
          onChange={(e) => setNewChassis(e.target.value)}
        />
      </div>

      <div className="existing-chassis-box">
        <label>Active Chassis Numbers in Stock:</label>
        {(!tractor.chassisList || tractor.chassisList.length === 0) ? (
          <p className="empty-notice">No physical chassis tagged yet.</p>
        ) : (
          <div className="chassis-tags-cloud">
            {tractor.chassisList.map((ch, i) => (
              <span key={i} className="chassis-tag-pill">{ch}</span>
            ))}
          </div>
        )}
      </div>

      <div className="stock-actions-row">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleStockUpdate(-1)}
          disabled={tractor.stockCount <= 0}
        >
          - 1 Delivered / Sold
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleStockUpdate(1)}
        >
          + 1 Stock Received
        </button>
      </div>
    </div>
  );
}
