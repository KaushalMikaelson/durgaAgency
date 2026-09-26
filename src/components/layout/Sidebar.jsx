// Sidebar Navigation Component for Maa Durga Engineering Dealership OS
import React from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';
import { motion } from '../../utils/motion.jsx';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Tractor,
  Receipt,
  MapPin,
  TrendingDown,
  Wallet,
  Map,
  Bot
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Customers & Leads', icon: Users, badgeKey: 'hotLeads' },
  { id: 'recommend', label: 'Recommendation', icon: Sparkles },
  { id: 'billing', label: 'Billing & Bills', icon: Receipt },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown },
  { id: 'cashflow', label: 'Cash & Bank', icon: Wallet },
  { id: 'villageMap', label: 'Village Sales Map', icon: Map },
  { id: 'aiAdvisor', label: 'AI Business Advisor', icon: Bot }
];

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { activeTab, setActiveTab, leads } = useDealership();

  const hotCount = leads.filter(l => Number(l.buyingScore) >= 75 || l.stage === 'Negotiation').length;

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand-header">
        <div className="brand-logo-badge">🚜</div>
        <div className="brand-info">
          <h1>Maa Durga Engineering</h1>
          <p>Tractor Showroom OS</p>
        </div>
      </div>

      <ul className="nav-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === 'leads' && hotCount > 0 && (
                  <span className="nav-badge hot">{hotCount} Hot</span>
                )}
                {isActive && (
                  <motion.div
                    className="active-pill"
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <span>Dealer Code: UP-GKP-89</span>
        <span>v3.0 React</span>
      </div>
    </aside>
  );
}
