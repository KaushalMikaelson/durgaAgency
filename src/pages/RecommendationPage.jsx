// Deterministic Agricultural Tractor Recommendation Wizard
import React, { useState } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { matchTractor } from '../utils/recommendation.js';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export function RecommendationPage() {
  const { tractors, openModal } = useDealership();

  const [landAcres, setLandAcres] = useState(12);
  const [soilType, setSoilType] = useState('Medium');
  const [budgetMax, setBudgetMax] = useState(850000);
  const [requiresHeavyTrolley, setRequiresHeavyTrolley] = useState(true);
  const [selectedImplements, setSelectedImplements] = useState(['Rotavator (6 ft)', 'Cultivator']);

  const handleToggleImplement = (imp) => {
    setSelectedImplements(prev => 
      prev.includes(imp) ? prev.filter(i => i !== imp) : [...prev, imp]
    );
  };

  const recommendations = matchTractor({
    landAcres: Number(landAcres),
    soilType,
    budgetMax: Number(budgetMax),
    requiresHeavyTrolley,
    implementsNeeded: selectedImplements,
    tractorsList: tractors
  });

  const topMatch = recommendations[0];

  return (
    <div className="page-container recommendation-page">
      <div className="page-header">
        <div>
          <h2>Agricultural Tractor Recommendation Engine</h2>
          <p>Deterministic agronomic match based on acreage, soil resistance, implements, and budget</p>
        </div>
      </div>

      <div className="recom-layout-grid">
        {/* Left Column: Form Controls */}
        <div className="recom-form-card">
          <h4>Farm Operational Requirements</h4>

          <div className="form-group">
            <label>Agricultural Land Holding: <strong>{landAcres} Acres</strong></label>
            <input
              type="range"
              min="2"
              max="50"
              value={landAcres}
              onChange={(e) => setLandAcres(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="form-group">
            <label>Dominant Soil Type</label>
            <select
              className="form-control"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            >
              <option value="Sandy Loam">Sandy Loam (Light resistance)</option>
              <option value="Medium">Medium Loam (Standard)</option>
              <option value="Clay Loam">Clay Loam (Heavy resistance)</option>
              <option value="Black Cotton">Black Cotton Soil / Wet Puddling (Requires 4WD)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Maximum Budget: <strong>₹{(budgetMax / 100000).toFixed(2)} Lakh</strong></label>
            <input
              type="range"
              min="600000"
              max="1000000"
              step="25000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="form-group">
            <label>Key Agricultural Implements Needed</label>
            <div className="implements-checkbox-grid">
              {['Rotavator (6 ft)', 'Rotavator (7 ft)', 'Cultivator', 'MB Plough', 'Laser Leveller', 'Thresher'].map((imp) => (
                <label key={imp} className="checkbox-chip">
                  <input
                    type="checkbox"
                    checked={selectedImplements.includes(imp)}
                    onChange={() => handleToggleImplement(imp)}
                  />
                  <span>{imp}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-chip">
              <input
                type="checkbox"
                checked={requiresHeavyTrolley}
                onChange={(e) => setRequiresHeavyTrolley(e.target.checked)}
              />
              <span>Heavy Commercial Trolley Haulage (8-12 Ton)</span>
            </label>
          </div>
        </div>

        {/* Right Column: Matched Model Results */}
        <div className="recom-results-card">
          <h4>Top Recommended Match</h4>
          {topMatch && (
            <div className="top-match-card">
              <div className="top-match-head">
                <span className="match-tag">🌟 BEST FIT FOR {landAcres} ACRES</span>
                <h3>{topMatch.tractor.brand} {topMatch.tractor.model}</h3>
                <span className="price-big font-mono font-bold text-emerald">
                  ₹{(topMatch.tractor.price / 100000).toFixed(2)} Lakh
                </span>
              </div>

              <div className="match-reasons-box">
                <h5>Why This VST Zetor Model:</h5>
                <ul>
                  {topMatch.reasons.map((r, i) => (
                    <li key={i}>
                      <CheckCircle size={15} className="text-emerald inline-icon" /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="match-actions">
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => openModal('lead', {
                    interestedModelId: topMatch.tractor.id,
                    landAcres,
                    soilType
                  })}
                >
                  Create Lead For This Model <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
