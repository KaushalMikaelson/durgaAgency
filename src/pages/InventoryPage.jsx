// VST Zetor Inventory, Stock & Landed Margins Page
import React from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { Tractor, TrendingUp, Package, Shield, Settings2 } from 'lucide-react';

export function InventoryPage() {
  const { tractors, openModal } = useDealership();

  return (
    <div className="page-container inventory-page">
      <div className="page-header">
        <div>
          <h2>VST Zetor Tractor Inventory & Dealership Margins</h2>
          <p>Official technical specifications, stock counts, chassis tags & landed unit economics</p>
        </div>
      </div>

      <div className="inventory-grid">
        {tractors.map((t) => {
          const inStock = Number(t.stockCount) > 0;
          const nominalMargin = Number(t.price || 0) - Number(t.dealerPurchaseCost || 0);

          return (
            <div key={t.id} className="tractor-card">
              <div className="trac-card-head">
                <div>
                  <span className="brand-badge">{t.brand}</span>
                  <h3>{t.model}</h3>
                </div>
                <span className={`stock-pill ${inStock ? 'in-stock' : 'order'}`}>
                  {inStock ? `${t.stockCount} In Stock` : 'Order on Demand'}
                </span>
              </div>

              <div className="trac-specs-grid">
                <div className="spec-item">
                  <span className="spec-lbl">Engine Power</span>
                  <span className="spec-val">{t.hp} HP</span>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">PTO Power</span>
                  <span className="spec-val">{t.ptoHp} HP</span>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">Drive Type</span>
                  <span className="spec-val">{t.drive}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">Hydraulic Lift</span>
                  <span className="spec-val">{t.liftCapacityKg} kg</span>
                </div>
              </div>

              {/* Pricing & Margin Bar */}
              <div className="trac-pricing-box">
                <div className="price-row">
                  <span>Ex-Showroom Price:</span>
                  <strong className="font-mono text-emerald">₹{(t.price / 100000).toFixed(2)} Lakh</strong>
                </div>
                <div className="price-row sub">
                  <span>Dealer Landed Base:</span>
                  <span className="font-mono">₹{(t.dealerPurchaseCost / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="price-row margin-highlight">
                  <span>Gross Margin:</span>
                  <span className="font-mono font-bold text-amber">₹{nominalMargin.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Tagged Chassis */}
              <div className="chassis-preview-box">
                <span className="chassis-lbl">Tagged Chassis:</span>
                {(!t.chassisList || t.chassisList.length === 0) ? (
                  <span className="none-txt">No chassis tagged</span>
                ) : (
                  <div className="chassis-chips">
                    {t.chassisList.map((ch, i) => (
                      <code key={i} className="chip">{ch}</code>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="trac-card-actions">
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => openModal('unitEconomics', t)}
                  title="View Freight, PDI & True Landed Margin"
                >
                  <TrendingUp size={15} /> Landed Margin
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => openModal('tractor', t)}
                  title="Manage Physical Stock & Chassis"
                >
                  <Package size={15} /> Stock ({t.stockCount})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
