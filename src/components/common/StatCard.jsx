// Metric Stat Card with Hover & Micro-Animations
import React from 'react';
import { motion } from '../../utils/motion.jsx';

export function StatCard({ label, value, subtext, icon: Icon, color = 'emerald' }) {
  return (
    <motion.div
      className={`stat-card stat-${color}`}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </motion.div>
  );
}
