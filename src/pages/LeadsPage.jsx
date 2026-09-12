// CRM & Farmer Leads Pipeline Page
import React, { useState } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { createWhatsAppUrl } from '../utils/whatsapp.js';
import { Users, Plus, Phone, MessageSquare, Search, Edit } from 'lucide-react';

export function LeadsPage() {
  const { leads, openModal } = useDealership();
  const [filterStage, setFilterStage] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = (
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.village && l.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.phone && l.phone.includes(searchTerm))
    );
    if (!matchesSearch) return false;

    if (filterStage === 'HOT') return Number(l.buyingScore) >= 75;
    if (filterStage === 'WARM') return Number(l.buyingScore) >= 50 && Number(l.buyingScore) < 75;
    if (filterStage !== 'ALL') return l.stage === filterStage;
    return true;
  });

  return (
    <div className="page-container leads-page">
      <div className="page-header">
        <div>
          <h2>Farmer Leads & CRM Pipeline</h2>
          <p>Customer enquiries, self-managed buying scores, and WhatsApp follow-ups</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openModal('lead')}>
            <Plus size={16} /> + New Farmer Lead
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="leads-controls-bar">
        <div className="stage-filter-pills">
          <button
            className={`pill-btn ${filterStage === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStage('ALL')}
          >
            All Leads ({leads.length})
          </button>
          <button
            className={`pill-btn hot ${filterStage === 'HOT' ? 'active' : ''}`}
            onClick={() => setFilterStage('HOT')}
          >
            🔥 Hot Priority ({leads.filter(l => Number(l.buyingScore) >= 75).length})
          </button>
          <button
            className={`pill-btn ${filterStage === 'Negotiation' ? 'active' : ''}`}
            onClick={() => setFilterStage('Negotiation')}
          >
            Negotiation
          </button>
          <button
            className={`pill-btn ${filterStage === 'Demo Scheduled' ? 'active' : ''}`}
            onClick={() => setFilterStage('Demo Scheduled')}
          >
            Demo Scheduled
          </button>
        </div>

        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search farmer name, village, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Leads Grid */}
      <div className="leads-grid">
        {filteredLeads.length === 0 ? (
          <div className="empty-state-large">
            <Users size={48} className="empty-icon" />
            <h4>No customer leads match filter</h4>
            <p>Try switching filter tabs or add a new enquiry.</p>
            <button className="btn btn-primary" onClick={() => openModal('lead')}>
              + Add First Lead
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const score = Number(lead.buyingScore) || 70;
            const scoreCls = score >= 75 ? 'hot' : score >= 50 ? 'warm' : 'cold';

            return (
              <div key={lead.id} className="lead-card">
                <div className="lead-card-head">
                  <div>
                    <h4>{lead.name}</h4>
                    <span className="lead-village">{lead.village ? `Village ${lead.village}` : 'Gorakhpur'}</span>
                  </div>
                  <span className={`badge-score ${scoreCls}`}>
                    Score: {score}/100
                  </span>
                </div>

                <div className="lead-card-body">
                  <div className="lead-meta-row">
                    <span>Interested Model:</span>
                    <strong>{lead.interestedModel || 'VST Zetor Tractor'}</strong>
                  </div>
                  {lead.landAcres > 0 && (
                    <div className="lead-meta-row">
                      <span>Land Holding:</span>
                      <span>{lead.landAcres} Acres</span>
                    </div>
                  )}
                  <div className="lead-meta-row">
                    <span>Stage:</span>
                    <span className="badge-stage">{lead.stage}</span>
                  </div>
                  {lead.nextAction && (
                    <div className="lead-next-action">
                      👉 <em>{lead.nextAction}</em>
                    </div>
                  )}
                </div>

                <div className="lead-card-footer">
                  <div className="lead-actions-left">
                    <a
                      href={`tel:${lead.phone}`}
                      className="btn-action-round"
                      title="Call Farmer"
                    >
                      <Phone size={15} />
                    </a>
                    <a
                      href={createWhatsAppUrl(lead.phone, `Namaskar ${lead.name} Ji 🙏 Maa Durga Engineering VST Zetor Dealership follow-up.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action-round wa"
                      title="Send WhatsApp"
                    >
                      <MessageSquare size={15} />
                    </a>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openModal('lead', lead)}
                  >
                    <Edit size={14} /> Edit Lead
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
