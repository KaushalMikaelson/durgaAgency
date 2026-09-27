// Executive Summary Stats & Business Intelligence Page for Maa Durga Engineering OS
// Ultra-Premium Dashboard built with Framer Motion, Lucide Icons, and Interactive Visuals
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalyticsViewModel } from '../analyticsEngine.js';
import { store } from '../store.js';
import { 
  BarChart3, 
  PieChart, 
  Printer, 
  Download, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Receipt, 
  Tractor, 
  Users, 
  MapPin, 
  Target,
  ArrowUpRight,
  Calendar,
  Wallet,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Award
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 350, damping: 25 } 
  }
};

// Mini sparkline SVG component for KPI cards
function KpiSparkline({ data, color, gradId }) {
  if (!data || data.length < 2) return null;
  const w = 120, h = 32, pad = 2;
  const maxV = Math.max(...data, 1);
  const minV = Math.min(...data, 0);
  const range = maxV - minV || 1;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - minV) / range) * (h - pad * 2);
    return { x, y };
  });
  const lineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaStr = `M ${points[0].x.toFixed(1)},${h} L ${lineStr} L ${points[points.length - 1].x.toFixed(1)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="kpi-sparkline-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaStr} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={lineStr}
      />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={color} stroke="#fff" strokeWidth="1" />
    </svg>
  );
}

export function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('monthly');
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredRevenueCat, setHoveredRevenueCat] = useState(null);
  const [hoveredExpenseCat, setHoveredExpenseCat] = useState(null);

  // Compute view model
  const vm = useMemo(() => {
    return getAnalyticsViewModel(timeframe, store);
  }, [timeframe]);

  const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['Maa Durga Engineering - Executive Summary Analytics MIS'],
      ['Period', vm.config.periodLabel],
      ['Timeframe', vm.config.name],
      ['Generated On', new Date().toLocaleString('en-IN')],
      [],
      ['Metric', 'Value'],
      ['Total Sales Turnover (Revenue)', vm.revenue],
      ['Total Showroom Expenses', vm.totalExpenses],
      ['Gross Profit Margin', vm.grossProfit],
      ['Net Profit', vm.netProfit],
      ['Cost of Goods Sold (COGS)', vm.cogs || 0],
      ['Total Cash Inflow', vm.cashIn],
      ['Total Cash Outflow', vm.cashOut],
      ['Net Cash Flow', vm.netCashFlow],
      ['Total Billed Invoices', vm.billsCount],
      ['Total Billed Amount (Rs)', vm.scaledBilledRupees],
      ['Total Paid / Collected (Rs)', vm.scaledPaidRupees],
      ['Outstanding Dues (Rs)', vm.scaledDueRupees],
      ['Payment Collection Rate (%)', `${vm.collectionRate}%`],
      ['Tractors Delivered (Units)', vm.tractorsDelivered],
      ['In-Stock Yard Units', vm.inStockUnits],
      ['Active Farmer Leads', vm.totalLeads],
      ['High Intent Hot Leads', vm.hotLeads || 0],
      [],
      ['Top Tractor Model', 'Units', 'Revenue (Rs)', 'Share (%)'],
      ...vm.topModels.map(m => [m.model, m.units, m.rev, `${m.pct}%`]),
      [],
      ['Top Village', 'Deals', 'Volume (Rs)', 'Share (%)'],
      ...vm.topVillages.map(v => [v.village, v.deals, v.vol, `${v.pct}%`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MDE_Executive_MIS_${vm.timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.app?.showToast) {
      window.app.showToast('Analytics summary exported as CSV spreadsheet', 'success', 'Export Complete');
    }
  };

  // Interactive Chart Render Calculation (Modern Capsule Track Bar Design)
  const chartProps = useMemo(() => {
    const width = 760;
    const height = 270;
    const padLeft = 55;
    const padRight = 25;
    const padTop = 25;
    const padBottom = 42;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const baselineY = padTop + chartH;
    const intervals = vm.chartIntervals || [];
    const maxVal = Math.max(1000, ...intervals.map(i => Math.max(i.revenue || 0, 1000))) * 1.15;

    const numBuckets = Math.max(1, intervals.length);
    const slotW = chartW / numBuckets;
    const barW = Math.max(28, Math.min(54, slotW * 0.54));
    const cornerRadius = Math.min(12, Math.round(barW / 2));

    const barsData = intervals.map((intv, idx) => {
      const centerX = padLeft + idx * slotW + slotW / 2;
      const barX = centerX - barW / 2;
      const revVal = intv.revenue || 0;
      const rawH = (revVal / maxVal) * chartH;
      const barH = revVal > 0 ? Math.max(cornerRadius * 2, rawH) : 0;
      const barY = baselineY - barH;

      return {
        centerX,
        barX,
        barY,
        barW,
        barH,
        slotW,
        cornerRadius,
        intv,
        idx
      };
    });

    const gridSteps = [0, 0.25, 0.5, 0.75, 1];
    const gridLines = gridSteps.map(step => {
      const y = baselineY - (step * chartH);
      const val = Math.round(step * maxVal);
      let label = val >= 10000000 ? `₹${(val / 10000000).toFixed(1)}Cr` :
                  val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` :
                  val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`;
      return { y, label };
    });

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      chartH,
      baselineY,
      gridLines,
      barsData,
      barW,
      cornerRadius
    };
  }, [vm.chartIntervals]);

  // Donut 1 & 2 circles calculation
  const getDonutSlices = (categories = [], hoveredIdx) => {
    const cats = categories || [];
    const C = 439.82; // 2 * PI * 70
    let cumulativeOffset = 0;
    return cats.map((cat, i) => {
      const dash = ((cat.pct || 0) / 100) * C;
      const gap = C - dash;
      const offset = cumulativeOffset;
      cumulativeOffset += dash;
      const isHovered = hoveredIdx === i;

      return {
        ...cat,
        dash,
        gap,
        offset,
        isHovered
      };
    });
  };

  const revenueSlices = useMemo(() => getDonutSlices(vm.revenueCategories || [], hoveredRevenueCat), [vm.revenueCategories, hoveredRevenueCat]);
  const expenseSlices = useMemo(() => getDonutSlices(vm.expenseCategories || [], hoveredExpenseCat), [vm.expenseCategories, hoveredExpenseCat]);

  const activeRevenueDisplay = (hoveredRevenueCat !== null && vm.revenueCategories && vm.revenueCategories[hoveredRevenueCat]) ? vm.revenueCategories[hoveredRevenueCat] : null;
  const activeExpenseDisplay = (hoveredExpenseCat !== null && vm.expenseCategories && vm.expenseCategories[hoveredExpenseCat]) ? vm.expenseCategories[hoveredExpenseCat] : null;

  return (
    <motion.div 
      className="page-container analytics-page"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="analytics-container">
        {/* Top Controls: Timeframe segmented control & Actions */}
        <motion.div className="analytics-top-bar" variants={itemVariants}>
          <div className="analytics-time-controls">
            <div className="timeframe-segmented-control" role="tablist">
              {[
                { id: 'daily', icon: '📅', label: 'Daily (दैनिक)' },
                { id: 'weekly', icon: '📆', label: 'Weekly (साप्ताहिक)' },
                { id: 'monthly', icon: '🗓️', label: 'Monthly (मासिक)' },
                { id: 'yearly', icon: '📈', label: 'Yearly (वार्षिक)' }
              ].map(tf => {
                const isActive = timeframe === tf.id;
                return (
                  <button 
                    key={tf.id}
                    className={`timeframe-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setTimeframe(tf.id)}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTimeframePill"
                        className="timeframe-pill-active-bg"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 9,
                          background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
                          boxShadow: '0 4px 12px rgba(4, 120, 87, 0.35)',
                          zIndex: -1
                        }}
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}
                    <span className="tf-icon">{tf.icon}</span> {tf.label}
                  </button>
                );
              })}
            </div>

            <div className="analytics-period-badge">
              <span className="analytics-pulse-dot"></span>
              <span>Live MIS: {vm.config.periodLabel}</span>
            </div>
          </div>

          <div className="analytics-actions">
            <button className="quick-action-btn btn-sm btn-outline" onClick={handlePrint} title="Print executive summary">
              <Printer size={15} /> Print Report
            </button>
            <button className="quick-action-btn btn-sm btn-primary" onClick={handleExportCSV} title="Export CSV spreadsheet">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </motion.div>

        {/* Executive Highlights Alert Hero Banner */}
        <motion.div className="analytics-executive-banner" variants={itemVariants}>
          <div className="analytics-banner-left">
            <h3><Sparkles size={20} /> Executive MIS Overview ({vm.config.name})</h3>
            <p>
              Actual sales turnover for this period is <strong>{fmt(vm.revenue)}</strong> across <strong>{vm.billsCount}</strong> retail bills and <strong>{vm.totalQuotes}</strong> quotations. 
              Net Profit stands at <strong>{fmt(vm.netProfit)}</strong> ({vm.netMarginPct}% margin) with a 
              <strong> {vm.collectionRate}%</strong> realization rate on billed amounts.
            </p>
          </div>
          <div className="analytics-banner-highlights">
            <div className="banner-highlight-box">
              <div className="hl-label">Turnover Realized</div>
              <div className="hl-value" style={{ color: '#34d399' }}>{fmt(vm.revenue)}</div>
            </div>
            <div className="banner-highlight-box">
              <div className="hl-label">Net Margin</div>
              <div className="hl-value" style={{ color: Number(vm.netMarginPct) >= 0 ? '#34d399' : '#fb7185' }}>{vm.netMarginPct}%</div>
            </div>
            <div className="banner-highlight-box">
              <div className="hl-label">Collection Rate</div>
              <div className="hl-value" style={{ color: '#60a5fa' }}>{vm.collectionRate}%</div>
            </div>
          </div>
        </motion.div>

        {/* 4 Ultra-Sleek KPI Metric Cards with Sparklines */}
        <motion.div className="analytics-metric-grid" variants={itemVariants}>
          {/* Revenue */}
          <motion.div 
            className="analytics-kpi-card emerald"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="analytics-kpi-header">
              <div className="analytics-kpi-title-wrap">
                <span className="analytics-kpi-title">Gross Turnover</span>
                <span className="analytics-kpi-sub">कुल बिक्री / राजस्व</span>
              </div>
              <div className="analytics-kpi-icon-badge emerald">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="analytics-kpi-value" style={{ color: '#047857' }}>{fmt(vm.revenue)}</div>
            <div className="kpi-sparkline-wrap">
              <KpiSparkline data={(vm.chartIntervals || []).map(i => i.revenue || 0)} color="#10b981" gradId="sparkRevGrad" />
            </div>
            <div className="analytics-kpi-footer">
              <span className="analytics-kpi-chip emerald">
                <Receipt size={12} /> Billed: {fmt(vm.scaledBilledRupees)}
              </span>
              <span className="analytics-kpi-aux">Collected: {fmt(vm.scaledPaidRupees)}</span>
            </div>
          </motion.div>

          {/* Net Profit */}
          <motion.div 
            className={`analytics-kpi-card ${vm.netProfit >= 0 ? 'emerald' : 'rose'}`}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="analytics-kpi-header">
              <div className="analytics-kpi-title-wrap">
                <span className="analytics-kpi-title">Net Profit</span>
                <span className="analytics-kpi-sub">शुद्ध मुनाफा</span>
              </div>
              <div className={`analytics-kpi-icon-badge ${vm.netProfit >= 0 ? 'emerald' : 'rose'}`}>
                {vm.netProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
            </div>
            <div className="analytics-kpi-value" style={{ color: vm.netProfit >= 0 ? '#047857' : '#b91c1c' }}>
              {fmt(vm.netProfit)}
            </div>
            <div className="kpi-sparkline-wrap">
              <KpiSparkline data={(vm.chartIntervals || []).map(i => i.net || 0)} color={vm.netProfit >= 0 ? '#10b981' : '#f43f5e'} gradId="sparkProfitGrad" />
            </div>
            <div className="analytics-kpi-footer">
              <span className={`analytics-kpi-chip ${vm.netProfit >= 0 ? 'emerald' : 'rose'}`}>
                <ArrowUpRight size={12} /> {vm.netMarginPct}% net margin
              </span>
              <span className="analytics-kpi-aux">Gross: {fmt(vm.grossProfit)}</span>
            </div>
          </motion.div>

          {/* Net Cash Balance */}
          <motion.div 
            className="analytics-kpi-card blue"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="analytics-kpi-header">
              <div className="analytics-kpi-title-wrap">
                <span className="analytics-kpi-title">Net Cash Balance</span>
                <span className="analytics-kpi-sub">शुद्ध रोकड़ प्रवाह</span>
              </div>
              <div className="analytics-kpi-icon-badge blue">
                <Wallet size={20} />
              </div>
            </div>
            <div className="analytics-kpi-value" style={{ color: '#1d4ed8' }}>{fmt(vm.netCashFlow)}</div>
            <div className="kpi-sparkline-wrap">
              <KpiSparkline data={(vm.chartIntervals || []).map(i => (i.revenue || 0) - (i.expense || 0))} color="#3b82f6" gradId="sparkCashGrad" />
            </div>
            <div className="analytics-kpi-footer">
              <span className="analytics-kpi-chip blue">
                <Coins size={12} /> In: {fmt(vm.cashIn)}
              </span>
              <span className="analytics-kpi-aux">Out: {fmt(vm.cashOut)}</span>
            </div>
          </motion.div>

          {/* Bills & Collections */}
          <motion.div 
            className="analytics-kpi-card amber"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="analytics-kpi-header">
              <div className="analytics-kpi-title-wrap">
                <span className="analytics-kpi-title">Bills & Collections</span>
                <span className="analytics-kpi-sub">बिल बुक एवं रसीदें</span>
              </div>
              <div className="analytics-kpi-icon-badge amber">
                <Receipt size={20} />
              </div>
            </div>
            <div className="analytics-kpi-value" style={{ color: '#b45309' }}>{fmt(vm.scaledPaidRupees)}</div>
            <div className="kpi-sparkline-wrap">
              <KpiSparkline data={(vm.chartIntervals || []).map(i => i.expense || 0)} color="#f59e0b" gradId="sparkBillGrad" />
            </div>
            <div className="analytics-kpi-footer">
              <span className="analytics-kpi-chip amber">
                <CheckCircle2 size={12} /> {vm.collectionRate}% collected
              </span>
              <span className="analytics-kpi-aux">{vm.billsCount} Bills ({vm.scaledDueRupees > 0 ? `${fmt(vm.scaledDueRupees)} Due` : 'Clear'})</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 1: Revenue Summary Capsule Bar Chart */}
        <motion.div className="analytics-card" variants={itemVariants}>
          <div className="analytics-card-header">
            <div>
              <div className="analytics-card-title">
                <BarChart3 size={19} color="#087f8c" /> Revenue Summary
              </div>
              <div className="analytics-card-subtitle">Periodic turnover distribution across {vm.config.name}</div>
            </div>
            <div className="analytics-period-badge">
              <span>● {vm.chartIntervals ? vm.chartIntervals.length : 0} Data Points</span>
            </div>
          </div>

          <div className="svg-bar-chart-container" style={{ position: 'relative' }}>
            {/* Interactive Hover Tooltip */}
            <AnimatePresence>
              {hoveredBarIndex !== null && chartProps.barsData[hoveredBarIndex] && (
                <motion.div 
                  className="analytics-chart-tooltip"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="tt-title">{chartProps.barsData[hoveredBarIndex].intv.label}</div>
                  <div className="tt-row">
                    <span style={{ color: '#087f8c' }}>Turnover:</span>
                    <span>{fmt(chartProps.barsData[hoveredBarIndex].intv.revenue)}</span>
                  </div>
                  {chartProps.barsData[hoveredBarIndex].intv.expense > 0 && (
                    <div className="tt-row">
                      <span style={{ color: '#9ca3af' }}>Expenses:</span>
                      <span>{fmt(chartProps.barsData[hoveredBarIndex].intv.expense)}</span>
                    </div>
                  )}
                  {chartProps.barsData[hoveredBarIndex].intv.net !== undefined && (
                    <div className="tt-row" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '3px' }}>
                      <span style={{ color: '#34d399' }}>Net Profit:</span>
                      <span style={{ color: chartProps.barsData[hoveredBarIndex].intv.net >= 0 ? '#34d399' : '#fb7185' }}>
                        {fmt(chartProps.barsData[hoveredBarIndex].intv.net)}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <svg viewBox={`0 0 ${chartProps.width} ${chartProps.height}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="tealBarGradReact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#087f8c" />
                  <stop offset="100%" stopColor="#006672" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {chartProps.gridLines.map((gl, i) => (
                <g key={i}>
                  <line 
                    x1={chartProps.padLeft} 
                    y1={gl.y} 
                    x2={chartProps.width - chartProps.padRight} 
                    y2={gl.y} 
                    stroke="var(--border-color)" 
                    strokeDasharray="4 4" 
                    strokeWidth="1" 
                    opacity="0.6"
                  />
                  <text 
                    x={chartProps.padLeft - 12} 
                    y={gl.y + 4} 
                    textAnchor="end" 
                    fill="var(--text-muted)" 
                    fontSize="11" 
                    fontWeight="600"
                  >
                    {gl.label}
                  </text>
                </g>
              ))}

              {/* Baseline Axis */}
              <line 
                x1={chartProps.padLeft} 
                y1={chartProps.baselineY} 
                x2={chartProps.width - chartProps.padRight} 
                y2={chartProps.baselineY} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
                opacity="0.8"
              />

              {/* Modern Rounded Capsule Bars */}
              {chartProps.barsData.map((bar, idx) => {
                const isHovered = hoveredBarIndex === idx;
                return (
                  <g 
                    key={idx} 
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Full-height Background Track Capsule */}
                    <rect 
                      x={bar.barX} 
                      y={chartProps.padTop} 
                      width={bar.barW} 
                      height={chartProps.chartH} 
                      rx={bar.cornerRadius} 
                      ry={bar.cornerRadius}
                      fill="var(--chart-track, rgba(0, 0, 0, 0.045))" 
                      style={{ transition: 'fill 0.2s ease' }}
                    />

                    {/* Active Solid Deep Teal Foreground Bar */}
                    {bar.barH > 0 && (
                      <rect 
                        x={bar.barX} 
                        y={bar.barY} 
                        width={bar.barW} 
                        height={bar.barH} 
                        rx={bar.cornerRadius} 
                        ry={bar.cornerRadius}
                        fill="url(#tealBarGradReact)" 
                        opacity={isHovered ? 1 : 0.95}
                        filter={isHovered ? 'drop-shadow(0 4px 10px rgba(8, 127, 140, 0.4))' : 'none'}
                        style={{ transition: 'opacity 0.2s ease, filter 0.2s ease' }}
                      />
                    )}

                    {/* X Axis Text */}
                    <text 
                      x={bar.centerX} 
                      y={chartProps.height - 12} 
                      textAnchor="middle" 
                      fill={isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'} 
                      fontSize="11.5" 
                      fontWeight={isHovered ? '700' : '600'}
                    >
                      {bar.intv.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="chart-legend-row">
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: 'linear-gradient(135deg, #087f8c, #006672)', borderRadius: '4px' }}></span>
              <span>Sales Turnover (राजस्व)</span>
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: 'var(--chart-track, #e2e8f0)', borderRadius: '4px' }}></span>
              <span>Capacity Track (क्षमता)</span>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Two Donut / Pie Charts Side-by-Side */}
        <motion.div className="analytics-grid-equal-2col" variants={itemVariants}>
          {/* Donut 1: Revenue by Tractor / Product Segment */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <div className="analytics-card-title">
                  <PieChart size={18} color="#059669" /> Revenue by Tractor & Product Segment
                </div>
                <div className="analytics-card-subtitle">Sales contribution percentage by model series & bills</div>
              </div>
            </div>

            <div className="donut-layout">
              {vm.revenueCategories.length > 0 ? (
                <>
                  <div className="donut-chart-svg-wrap">
                    <svg viewBox="0 0 200 200" width="100%" height="100%">
                      <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" strokeWidth="24" opacity="0.35" />
                      {revenueSlices.map((slice, i) => (
                        <circle
                          key={i}
                          cx="100"
                          cy="100"
                          r="70"
                          fill="none"
                          stroke={slice.color}
                          strokeWidth={slice.isHovered ? 30 : 24}
                          strokeDasharray={`${slice.dash.toFixed(2)} ${slice.gap.toFixed(2)}`}
                          strokeDashoffset={`-${slice.offset.toFixed(2)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 100 100)"
                          onMouseEnter={() => setHoveredRevenueCat(i)}
                          onMouseLeave={() => setHoveredRevenueCat(null)}
                          style={{ transition: 'stroke-width 0.25s ease, opacity 0.2s ease', cursor: 'pointer', opacity: (hoveredRevenueCat !== null && !slice.isHovered) ? 0.6 : 1 }}
                        >
                          <title>{slice.label}: {fmt(slice.value)} ({slice.pct}%)</title>
                        </circle>
                      ))}
                    </svg>
                    <div className="donut-center-info">
                      <div className="center-val">
                        {activeRevenueDisplay ? fmt(activeRevenueDisplay.value) : fmt(vm.revenue)}
                      </div>
                      <div className="center-lbl">
                        {activeRevenueDisplay ? activeRevenueDisplay.label.split(' ')[0] : 'Total Turnover'}
                      </div>
                    </div>
                  </div>

                  <div className="donut-legend-list">
                    {vm.revenueCategories.map((cat, i) => (
                      <div 
                        key={i} 
                        className={`donut-legend-row ${hoveredRevenueCat === i ? 'highlighted' : ''}`}
                        onMouseEnter={() => setHoveredRevenueCat(i)}
                        onMouseLeave={() => setHoveredRevenueCat(null)}
                      >
                        <div className="donut-legend-top">
                          <div className="donut-legend-title">
                            <span className="donut-legend-dot" style={{ background: cat.color }}></span>
                            <span>{cat.label}</span>
                          </div>
                          <div className="donut-legend-metrics">
                            <span className="donut-legend-amt">{fmt(cat.value)}</span>
                            <span className="donut-legend-pct">{cat.pct}%</span>
                          </div>
                        </div>
                        <div className="donut-micro-track">
                          <div className="donut-micro-fill" style={{ width: `${cat.pct}%`, background: cat.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                  <Receipt size={32} style={{ margin: '0 auto 8px', opacity: 0.35 }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No bills or quotations recorded in this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Donut 2: Showroom Operating Expense Distribution */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <div className="analytics-card-title">
                  <PieChart size={18} color="#ef4444" /> Operating Expense Distribution
                </div>
                <div className="analytics-card-subtitle">Where dealership capital is deployed across operations</div>
              </div>
            </div>

            <div className="donut-layout">
              {vm.expenseCategories.length > 0 ? (
                <>
                  <div className="donut-chart-svg-wrap">
                    <svg viewBox="0 0 200 200" width="100%" height="100%">
                      <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" strokeWidth="24" opacity="0.35" />
                      {expenseSlices.map((slice, i) => (
                        <circle
                          key={i}
                          cx="100"
                          cy="100"
                          r="70"
                          fill="none"
                          stroke={slice.color}
                          strokeWidth={slice.isHovered ? 30 : 24}
                          strokeDasharray={`${slice.dash.toFixed(2)} ${slice.gap.toFixed(2)}`}
                          strokeDashoffset={`-${slice.offset.toFixed(2)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 100 100)"
                          onMouseEnter={() => setHoveredExpenseCat(i)}
                          onMouseLeave={() => setHoveredExpenseCat(null)}
                          style={{ transition: 'stroke-width 0.25s ease, opacity 0.2s ease', cursor: 'pointer', opacity: (hoveredExpenseCat !== null && !slice.isHovered) ? 0.6 : 1 }}
                        >
                          <title>{slice.label}: {fmt(slice.value)} ({slice.pct}%)</title>
                        </circle>
                      ))}
                    </svg>
                    <div className="donut-center-info">
                      <div className="center-val">
                        {activeExpenseDisplay ? fmt(activeExpenseDisplay.value) : fmt(vm.totalExpenses)}
                      </div>
                      <div className="center-lbl">
                        {activeExpenseDisplay ? activeExpenseDisplay.label.split(' ')[0] : 'Total Overheads'}
                      </div>
                    </div>
                  </div>

                  <div className="donut-legend-list">
                    {vm.expenseCategories.map((cat, i) => (
                      <div 
                        key={i} 
                        className={`donut-legend-row ${hoveredExpenseCat === i ? 'highlighted' : ''}`}
                        onMouseEnter={() => setHoveredExpenseCat(i)}
                        onMouseLeave={() => setHoveredExpenseCat(null)}
                      >
                        <div className="donut-legend-top">
                          <div className="donut-legend-title">
                            <span className="donut-legend-dot" style={{ background: cat.color }}></span>
                            <span>{cat.label}</span>
                          </div>
                          <div className="donut-legend-metrics">
                            <span className="donut-legend-amt">{fmt(cat.value)}</span>
                            <span className="donut-legend-pct" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>{cat.pct}%</span>
                          </div>
                        </div>
                        <div className="donut-micro-track">
                          <div className="donut-micro-fill" style={{ width: `${cat.pct}%`, background: cat.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                  <Wallet size={32} style={{ margin: '0 auto 8px', opacity: 0.35 }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No approved expenses recorded in this period</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section 3: Operations, Funnels & Top Models Progress Bars */}
        <motion.div className="analytics-grid-2col" variants={itemVariants}>
          {/* Progress Meters & Lead Funnel */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <div className="analytics-card-title">
                  <Target size={18} color="#059669" /> Performance Progress & Conversion Funnel
                </div>
                <div className="analytics-card-subtitle">Sales realization, collection efficiency & inquiry lifecycle</div>
              </div>
            </div>

            <div className="progress-meters-list" style={{ marginBottom: '24px' }}>
              {/* Payment Realization Efficiency */}
              <div className="meter-item">
                <div className="meter-header">
                  <span className="meter-title">
                    <Receipt size={15} color="#059669" /> Invoice Payment Realization ({fmt(vm.scaledPaidRupees)} of {fmt(vm.scaledBilledRupees)})
                  </span>
                  <span className="meter-stat" style={{ color: '#047857' }}>{vm.collectionRate}%</span>
                </div>
                <div className="meter-track">
                  <motion.div 
                    className="meter-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, vm.collectionRate)}%` }}
                    style={{ background: 'linear-gradient(90deg, #34d399, #059669)' }}
                  />
                </div>
              </div>

              {/* Cash Ledger Flow Meter */}
              <div className="meter-item">
                <div className="meter-header">
                  <span className="meter-title">
                    <Coins size={15} color="#2563eb" /> Cash Counter Ratio (In: {fmt(vm.cashIn)} | Out: {fmt(vm.cashOut)})
                  </span>
                  <span className="meter-stat" style={{ color: '#2563eb' }}>
                    {vm.cashIn > 0 ? `${Math.round(Math.min(100, Math.max(0, (vm.netCashFlow / vm.cashIn) * 100)))}% Net` : 'Balanced'}
                  </span>
                </div>
                <div className="meter-track">
                  <motion.div 
                    className="meter-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: `${vm.cashIn > 0 ? Math.min(100, Math.max(0, (vm.netCashFlow / vm.cashIn) * 100)) : 0}%` }}
                    style={{ background: 'linear-gradient(90deg, #60a5fa, #1d4ed8)' }}
                  />
                </div>
              </div>
            </div>

            {/* Customer Funnel */}
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={17} color="#059669" /> Farmer Purchase Journey Funnel
            </div>
            <div className="funnel-container">
              {vm.funnelSteps.map(fn => (
                <div key={fn.step} className="funnel-step">
                  <div className="funnel-step-badge">{fn.step}</div>
                  <span className="funnel-step-label">{fn.label}</span>
                  <div className="funnel-step-bar-wrap">
                    <motion.div 
                      className="funnel-step-bar-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${fn.pct}%` }}
                      style={{ background: fn.bg }}
                    >
                      {fn.pct}%
                    </motion.div>
                  </div>
                  <span className="funnel-step-count">{fn.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Models & Village Demand Clusters */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <div className="analytics-card-title">
                  <Tractor size={18} color="#059669" /> Top Tractor Models & Village Demand
                </div>
                <div className="analytics-card-subtitle">Volume ranking from live quotes and customer inquiries</div>
              </div>
            </div>

            {/* Top Models */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {vm.topModels.length > 0 ? (
                vm.topModels.map((tm, idx) => (
                  <div key={idx} className="model-rank-card">
                    <div className="model-rank-header">
                      <div className="model-rank-title">
                        <span className="model-rank-tag">#{idx + 1}</span>
                        <strong>{tm.model}</strong>
                      </div>
                      <span className="model-rank-metrics">{tm.units} Units ({fmt(tm.rev)})</span>
                    </div>
                    <div className="meter-track" style={{ height: '7px' }}>
                      <motion.div 
                        className="meter-fill" 
                        initial={{ width: 0 }}
                        animate={{ width: `${tm.pct}%` }}
                        style={{ background: tm.color }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '18px 12px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                  <Tractor size={24} style={{ margin: '0 auto 6px', opacity: 0.35 }} />
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>No tractor quote or delivery records in this period</p>
                </div>
              )}
            </div>

            {/* Territory Villages */}
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={17} color="#059669" /> Territory Village Rankings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {vm.topVillages.length > 0 ? (
                vm.topVillages.map((tv, idx) => {
                  const medals = ['🥇', '🥈', '🥉', '🔹', '🔹'];
                  return (
                    <div key={idx} className="village-rank-card">
                      <div className="village-rank-left">
                        <span className="village-medal">{medals[idx] || '🔹'}</span>
                        <span className="village-name">{tv.village}</span>
                      </div>
                      <div className="village-rank-right">
                        <span className="village-deals-badge">{tv.deals} Deals</span>
                        <span className="village-vol-chip">{fmt(tv.vol)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '18px 12px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                  <MapPin size={24} style={{ margin: '0 auto 6px', opacity: 0.35 }} />
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>No village customer records for this period</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section 4: Consolidated Executive Statement Table */}
        <motion.div className="statement-panel-card" variants={itemVariants}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Receipt size={18} color="#059669" /> Consolidated MIS Financial Statement ({vm.config.periodLabel})
              </div>
              <div className="panel-subtitle">Official dealership summary statement computed strictly from actual transactions</div>
            </div>
            <button className="quick-action-btn btn-sm btn-outline" onClick={() => window.print()}>
              <Printer size={15} /> Print Statement
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stream / Activity</th>
                  <th>Category</th>
                  <th>Volume / Units</th>
                  <th className="text-right">Inflow / Revenue (₹)</th>
                  <th className="text-right">Outflow / Cost (₹)</th>
                  <th className="text-right">Net Contribution (₹)</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {vm.statementRows.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.activity}</strong></td>
                    <td>{row.category}</td>
                    <td>{row.volume}</td>
                    <td className="text-right" style={{ color: 'var(--success)', fontWeight: 800 }}>{row.inflow > 0 ? fmt(row.inflow) : '-'}</td>
                    <td className="text-right" style={{ color: 'var(--danger)' }}>{row.outflow > 0 ? fmt(row.outflow) : '-'}</td>
                    <td className="text-right" style={{ color: row.net >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 800 }}>
                      {row.net !== 0 ? `${row.net > 0 ? '+' : ''}${fmt(row.net)}` : '₹0'}
                    </td>
                    <td className="text-center"><span className={`badge ${row.statusBadge}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-main)', fontWeight: 900 }}>
                  <td colSpan={3}><strong>Consolidated Totals ({vm.config.name})</strong></td>
                  <td className="text-right" style={{ color: 'var(--success)', fontSize: '15px' }}>{fmt(vm.revenue)}</td>
                  <td className="text-right" style={{ color: 'var(--danger)', fontSize: '15px' }}>{fmt(vm.totalExpenses + (vm.cogs || 0))}</td>
                  <td className="text-right" style={{ color: vm.netProfit >= 0 ? 'var(--primary)' : 'var(--danger)', fontSize: '16px' }}>
                    {vm.netProfit >= 0 ? '+' : ''}{fmt(vm.netProfit)}
                  </td>
                  <td className="text-center"><span className="badge badge-gold">Active</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
