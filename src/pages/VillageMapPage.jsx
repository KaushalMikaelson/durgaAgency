// Village Territory & Sales Cluster Intelligence Page
import React from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { Map, MapPin } from 'lucide-react';

export function VillageMapPage() {
  const { leads } = useDealership();

  // Aggregate farmer demand by village
  const villageDemand = {};
  for (const l of leads) {
    const v = l.village || 'Gorakhpur Town';
    villageDemand[v] = (villageDemand[v] || 0) + 1;
  }

  const sortedVillages = Object.entries(villageDemand).sort((a, b) => b[1] - a[1]);

  return (
    <div className="page-container village-map-page">
      <div className="page-header">
        <div>
          <h2>Village Sales Map & Demand Clustering</h2>
          <p>Territory intelligence to plan tractor demonstration routes and marketing camps</p>
        </div>
      </div>

      <div className="villages-grid">
        {sortedVillages.map(([village, count]) => (
          <div key={village} className="village-card">
            <div className="v-card-head">
              <MapPin size={18} className="text-emerald" />
              <h4>Village {village}</h4>
            </div>
            <div className="v-card-metric">
              <span className="v-count font-bold font-mono">{count}</span>
              <span className="v-lbl">Active Farmer {count === 1 ? 'Enquiry' : 'Enquiries'}</span>
            </div>
            <p className="v-rec">
              Recommended route for VST Zetor 4511 demonstration trolley.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
