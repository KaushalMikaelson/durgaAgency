// Add / Edit Lead Modal with Buying Score & WhatsApp Nurture
import React, { useState } from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';
import { suggestLeadBuyingScore } from '../../utils/buyingScore.js';
import { generateFollowUpSequences, createWhatsAppUrl } from '../../utils/whatsapp.js';
import { MessageSquare, Sparkles, Send } from 'lucide-react';

export function LeadModal({ initialData = null, onClose }) {
  const { saveLead, tractors } = useDealership();

  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [village, setVillage] = useState(initialData?.village || '');
  const [landAcres, setLandAcres] = useState(initialData?.landAcres || '');
  const [soilType, setSoilType] = useState(initialData?.soilType || 'Medium');
  const [interestedModelId, setInterestedModelId] = useState(initialData?.interestedModelId || '');
  const [stage, setStage] = useState(initialData?.stage || 'New Enquiry');
  const [buyingScore, setBuyingScore] = useState(initialData?.buyingScore || 70);
  const [financeRequired, setFinanceRequired] = useState(initialData?.financeRequired ?? true);
  const [exchangeWanted, setExchangeWanted] = useState(initialData?.exchangeWanted ?? false);
  const [nextAction, setNextAction] = useState(initialData?.nextAction || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const handleSuggestScore = () => {
    const suggestion = suggestLeadBuyingScore({
      stage,
      expectedPurchaseDays: stage === 'Negotiation' ? 7 : 20,
      financeRequired,
      exchangeWanted
    });
    setBuyingScore(suggestion.score);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedTractor = tractors.find(t => t.id === interestedModelId);

    const leadPayload = {
      id: initialData?.id,
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      landAcres: Number(landAcres) || 0,
      soilType,
      interestedModelId,
      interestedModel: selectedTractor ? `${selectedTractor.brand} ${selectedTractor.model}` : '',
      stage,
      buyingScore: Number(buyingScore),
      financeRequired,
      exchangeWanted,
      nextAction: nextAction.trim() || 'Follow up on tractor enquiry',
      notes: notes.trim()
    };

    saveLead(leadPayload);
    onClose();
  };

  const sequences = generateFollowUpSequences({
    name,
    village,
    landAcres,
    phone
  }, tractors.find(t => t.id === interestedModelId));

  return (
    <div className="lead-modal-content">
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Farmer Name *</label>
            <input
              type="text"
              required
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rameshwar Singh"
            />
          </div>
          <div className="form-group flex-1">
            <label>Mobile Number *</label>
            <input
              type="tel"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 98380 12345"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Village / Block</label>
            <input
              type="text"
              className="form-control"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Pipraich, Gorakhpur"
            />
          </div>
          <div className="form-group flex-1">
            <label>Land Holding (Acres)</label>
            <input
              type="number"
              className="form-control"
              value={landAcres}
              onChange={(e) => setLandAcres(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Interested VST Zetor Model</label>
            <select
              className="form-control"
              value={interestedModelId}
              onChange={(e) => setInterestedModelId(e.target.value)}
            >
              <option value="">-- Select Model --</option>
              {tractors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.brand} {t.model} ({t.hp} HP) - ₹{(t.price / 100000).toFixed(2)}L
                </option>
              ))}
            </select>
          </div>
          <div className="form-group flex-1">
            <label>Sales Pipeline Stage</label>
            <select
              className="form-control"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="New Enquiry">New Enquiry</option>
              <option value="Needs Analyzed">Needs Analyzed</option>
              <option value="Demo Scheduled">Demo Scheduled</option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Negotiation">Negotiation (Hot Deal)</option>
              <option value="Booked / Delivered">Booked / Delivered</option>
            </select>
          </div>
        </div>

        {/* Buying Score Bar */}
        <div className="score-control-box">
          <div className="score-header">
            <span>Lead Buying Score: <strong>{buyingScore}/100</strong></span>
            <button
              type="button"
              className="btn-score-suggest"
              onClick={handleSuggestScore}
            >
              <Sparkles size={14} /> Calculate Suggestion
            </button>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={buyingScore}
            onChange={(e) => setBuyingScore(Number(e.target.value))}
            className="score-range-slider"
          />
          <div className="score-badges-row">
            <span className={`score-pill ${buyingScore >= 75 ? 'hot' : buyingScore >= 50 ? 'warm' : 'cold'}`}>
              {buyingScore >= 75 ? '🔥 HOT PRIORITY' : buyingScore >= 50 ? '⚡ WARM LEAD' : '❄️ COLD / NURTURE'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Immediate Next Action</label>
          <input
            type="text"
            className="form-control"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Call today to schedule field demo"
          />
        </div>

        <div className="form-group">
          <label>Dealer Notes</label>
          <textarea
            className="form-control"
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special requirements, crop details, exchange tractor model..."
          />
        </div>

        {/* WhatsApp Sequences Toggle */}
        <div className="whatsapp-toggle-section">
          <button
            type="button"
            className="btn-wa-toggle"
            onClick={() => setShowWhatsApp(!showWhatsApp)}
          >
            <MessageSquare size={16} /> {showWhatsApp ? 'Hide WhatsApp Sequences' : 'View WhatsApp Nurture Templates'}
          </button>
          {showWhatsApp && (
            <div className="wa-sequences-card">
              {sequences.map((s, idx) => (
                <div key={idx} className="wa-seq-item">
                  <div className="wa-seq-head">
                    <strong>{s.title}</strong>
                    <a
                      href={createWhatsAppUrl(phone, s.body)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa-send"
                    >
                      <Send size={13} /> Send WhatsApp
                    </a>
                  </div>
                  <pre className="wa-seq-preview">{s.body}</pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Lead
          </button>
        </div>
      </form>
    </div>
  );
}
