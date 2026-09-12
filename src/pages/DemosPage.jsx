// Field Demonstrations Scheduling & Tracker Page
import React from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export function DemosPage() {
  const { demos } = useDealership();

  return (
    <div className="page-container demos-page">
      <div className="page-header">
        <div>
          <h2>Village Field Demonstrations</h2>
          <p>Schedule and track tractor rotavator field trials in surrounding farmer villages</p>
        </div>
      </div>

      <div className="demos-grid">
        {demos.map((d) => (
          <div key={d.id} className="demo-card">
            <div className="demo-card-head">
              <span className="village-badge"><MapPin size={14} /> Village {d.village}</span>
              <span className="demo-status">{d.status}</span>
            </div>
            <h4>{d.farmerName}</h4>
            <p className="demo-phone">{d.phone}</p>

            <div className="demo-details-box">
              <div><strong>Model:</strong> {d.tractorModel}</div>
              <div><strong>Implement:</strong> {d.implement}</div>
              <div><strong>Date:</strong> {d.scheduledDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
