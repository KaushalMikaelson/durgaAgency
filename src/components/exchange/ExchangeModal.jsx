// Used Tractor Exchange Valuation & Inspection Modal
import React, { useState } from 'react';
import { evaluateUsedTractor } from '../../utils/exchangeEvaluator.js';

export function ExchangeModal({ onClose }) {
  const [brand, setBrand] = useState('Mahindra');
  const [model, setModel] = useState('575 DI');
  const [year, setYear] = useState(2018);
  const [hours, setHours] = useState(3200);
  const [tyres, setTyres] = useState(65);
  const [engine, setEngine] = useState('Good');
  const [hydraulics, setHydraulics] = useState('Good');
  const [transmission, setTransmission] = useState('Good');

  const [valuation, setValuation] = useState(() => evaluateUsedTractor({
    brand: 'Mahindra',
    model: '575 DI',
    manufactureYear: 2018,
    meterHours: 3200,
    tyreConditionPercent: 65,
    engineCondition: 'Good',
    hydraulicsCondition: 'Good',
    transmissionCondition: 'Good'
  }));

  const handleCalculate = (e) => {
    e.preventDefault();
    const result = evaluateUsedTractor({
      brand,
      model,
      manufactureYear: Number(year),
      meterHours: Number(hours),
      tyreConditionPercent: Number(tyres),
      engineCondition: engine,
      hydraulicsCondition: hydraulics,
      transmissionCondition: transmission
    });
    setValuation(result);
  };

  return (
    <div className="exchange-modal-grid">
      <form onSubmit={handleCalculate} className="exchange-form">
        <h4>Used Tractor Inspection Details</h4>
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Brand</label>
            <input
              type="text"
              className="form-control"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div className="form-group flex-1">
            <label>Model</label>
            <input
              type="text"
              className="form-control"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Mfg Year</label>
            <input
              type="number"
              className="form-control"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="form-group flex-1">
            <label>Meter Hours</label>
            <input
              type="number"
              className="form-control"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="form-group flex-1">
            <label>Tyre Life (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="form-control"
              value={tyres}
              onChange={(e) => setTyres(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Engine Health</label>
            <select
              className="form-control"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
            >
              <option value="Excellent">Excellent (Zero Smoke)</option>
              <option value="Good">Good</option>
              <option value="Average">Average (Minor blow-by)</option>
              <option value="Poor">Poor (Overhaul needed)</option>
            </select>
          </div>
          <div className="form-group flex-1">
            <label>Hydraulic Lift</label>
            <select
              className="form-control"
              value={hydraulics}
              onChange={(e) => setHydraulics(e.target.value)}
            >
              <option value="Good">Good (Fast response)</option>
              <option value="Poor">Weak / Leakage</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Recalculate Valuation
        </button>
      </form>

      {/* Result Card */}
      {valuation && (
        <div className="exchange-result-box">
          <h4>Showroom Exchange Valuation</h4>
          <div className="valuation-highlight">
            <span className="val-lbl">Recommended Exchange Offer</span>
            <span className="val-amt font-mono">₹{valuation.recommendedOffer.toLocaleString('en-IN')}</span>
            <span className="val-sub">Fair Market Range: ₹{valuation.minValuation.toLocaleString('en-IN')} - ₹{valuation.maxValuation.toLocaleString('en-IN')}</span>
          </div>

          <div className="inspection-list">
            <h5>Key Inspection Points</h5>
            <ul>
              {valuation.inspectionChecklist.map((item, idx) => (
                <li key={idx}>
                  <span>{item.item}</span>
                  <strong>{item.status}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
