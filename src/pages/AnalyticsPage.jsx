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
  Award,
  Scale,
  Activity
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
  const [trendTf, setTrendTf] = useState('weekly'); // Default to weekly for intuitive day-by-day comparison
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState(null);
  const [selectedPointIdx, setSelectedPointIdx] = useState(null); // Click on a dot to open detailed card
  const [activeFocus, setActiveFocus] = useState(null); // Click to highlight a curve
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [comparisonWeek, setComparisonWeek] = useState('prev');
  const [comparisonMonth, setComparisonMonth] = useState('prev');
  const [visibleLines, setVisibleLines] = useState({
    income: true,
    expense: true,
    netprofit: true,
    netBalanceTillDate: true,
    comparison: true
  });
  const [hoveredRevenueCat, setHoveredRevenueCat] = useState(null);
  const [hoveredExpenseCat, setHoveredExpenseCat] = useState(null);

  // Compute view model for global page KPIs
  const vm = useMemo(() => {
    return getAnalyticsViewModel(timeframe, store);
  }, [timeframe, store]);

  // Available months for dropdown selector (last 6 months)
  const availableMonths = useMemo(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const curM = now.getMonth();
    const curY = now.getFullYear();
    const res = [];
    for (let i = 0; i < 6; i++) {
      let m = curM - i;
      let y = curY;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      res.push({
        value: m,
        year: y,
        label: `${monthNames[m]} ${y}${i === 0 ? ' (Current)' : ''}`
      });
    }
    return res;
  }, []);

  // Compute trend & comparison view model for the multi-line chart & comparison cards
  const trendVm = useMemo(() => {
    return getAnalyticsViewModel(trendTf, store, {
      selectedWeek,
      selectedMonth,
      selectedYear,
      comparisonWeek,
      comparisonMonth
    });
  }, [trendTf, store, selectedWeek, selectedMonth, selectedYear, comparisonWeek, comparisonMonth]);

  // Aggregated totals for the active trend period (Income, Expense, Net Profit, Net Balance Till Date)
  const trendTotals = useMemo(() => {
    const intervals = trendVm.chartIntervals || [];
    const inc = intervals.reduce((s, i) => s + (i.income || i.revenue || 0), 0);
    const exp = intervals.reduce((s, i) => s + (i.expense || 0), 0);
    const netp = intervals.reduce((s, i) => s + (i.netprofit !== undefined ? i.netprofit : (i.net || 0)), 0);
    const lastInterval = intervals[intervals.length - 1];
    const tillDateBal = lastInterval?.netBalanceTillDate !== undefined
      ? lastInterval.netBalanceTillDate
      : (trendVm.netBalanceTillDate || 0);
    return {
      income: inc || trendVm.revenue || 0,
      expense: exp || trendVm.totalExpenses || 0,
      netprofit: netp || trendVm.netProfit || Math.max(0, (inc || trendVm.revenue || 0) - (exp || trendVm.totalExpenses || 0)),
      netBalanceTillDate: tillDateBal
    };
  }, [trendVm]);

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

  // Multi-Line Trend Chart Render Calculation - Fritsch-Carlson Monotone Spline (No-Overshoot)
  const lineChartProps = useMemo(() => {
    const width = 840;
    const height = 310;
    const padLeft = 60;
    const padRight = 30;
    const padTop = 32;
    const padBottom = 45;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const intervals = trendVm.chartIntervals || [];

    const allVals = [];
    intervals.forEach(i => {
      const inc = i.income || i.revenue || 0;
      const exp = i.expense || 0;
      const netp = i.netprofit !== undefined ? i.netprofit : (i.net || 0);
      const bal = i.netBalanceTillDate !== undefined ? i.netBalanceTillDate : (i.balance || 0);

      if (visibleLines.income) allVals.push(inc);
      if (visibleLines.expense) allVals.push(exp);
      if (visibleLines.netprofit) allVals.push(netp);
      if (visibleLines.netBalanceTillDate) allVals.push(bal);
      if (visibleLines.comparison && i.compIncome) allVals.push(i.compIncome);
    });

    const maxDataVal = Math.max(1000, ...allVals);
    // Find clean, round ceiling for Y-axis intervals (no weird numbers like 22k)
    let niceMax = 10000;
    if (maxDataVal <= 1000) niceMax = 1000;
    else if (maxDataVal <= 2500) niceMax = 2500;
    else if (maxDataVal <= 5000) niceMax = 5000;
    else if (maxDataVal <= 10000) niceMax = 10000;
    else if (maxDataVal <= 20000) niceMax = 20000;
    else if (maxDataVal <= 30000) niceMax = 30000;
    else if (maxDataVal <= 50000) niceMax = 50000;
    else if (maxDataVal <= 100000) niceMax = 100000;
    else niceMax = Math.ceil(maxDataVal / 25000) * 25000;

    const minVal = 0; // Clean baseline at zero
    const range = (niceMax - minVal) || 1;

    const getY = (v) => {
      const val = Math.max(0, Math.min(niceMax, v || 0));
      return padTop + plotH - ((val - minVal) / range) * plotH;
    };

    const getX = (idx) => {
      if (intervals.length <= 1) return padLeft + plotW / 2;
      return padLeft + (idx / (intervals.length - 1)) * plotW;
    };

    const zeroY = getY(0);

    const series = [
      {
        key: 'income',
        name: 'Income',
        nameHi: 'आय',
        color: '#10b981', // Emerald Green
        strokeWidth: 3, // Clean solid line
        strokeDash: '',
        pointRadius: 5,
        gradId: null, // Zero area fill
        active: visibleLines.income,
        data: intervals.map((intv, idx) => {
          const v = intv.income || intv.revenue || 0;
          return { x: getX(idx), y: getY(v), val: v, label: intv.label };
        })
      },
      {
        key: 'expense',
        name: 'Expense',
        nameHi: 'खर्च',
        color: '#ef4444', // Coral / Red
        strokeWidth: 2.5,
        strokeDash: '',
        pointRadius: 4,
        gradId: null,
        active: visibleLines.expense,
        data: intervals.map((intv, idx) => {
          const v = intv.expense || 0;
          return { x: getX(idx), y: getY(v), val: v, label: intv.label };
        })
      },
      {
        key: 'netprofit',
        name: 'Net Profit',
        nameHi: 'शुद्ध लाभ',
        color: '#2563eb', // Royal Blue
        strokeWidth: 3,
        strokeDash: '',
        pointRadius: 4.5,
        gradId: null,
        active: visibleLines.netprofit,
        data: intervals.map((intv, idx) => {
          const v = intv.netprofit !== undefined ? intv.netprofit : Math.max(0, (intv.income || 0) - (intv.expense || 0));
          return { x: getX(idx), y: getY(v), val: v, label: intv.label };
        })
      },
      {
        key: 'netBalanceTillDate',
        name: 'Net Balance Till Date',
        nameHi: 'कुल बैलेंस (अब तक)',
        color: '#f59e0b', // Amber Gold
        strokeWidth: 2.8,
        strokeDash: '5 3', // Dotted / dashed pattern for distinction
        pointRadius: 4,
        gradId: null,
        active: visibleLines.netBalanceTillDate,
        data: intervals.map((intv, idx) => {
          const v = intv.netBalanceTillDate !== undefined ? intv.netBalanceTillDate : (intv.balance || 0);
          return { x: getX(idx), y: getY(v), val: v, label: intv.label };
        })
      }
    ];

    // Optional comparison reference curve
    const hasComparison = (trendTf === 'weekly' && comparisonWeek !== 'none') || (trendTf === 'monthly' && comparisonMonth !== 'none');
    if (hasComparison) {
      const compLabelName = trendTf === 'weekly' 
        ? (comparisonWeek === 'prev' ? 'Prev Week' : comparisonWeek.toUpperCase())
        : 'Prev Month';
      series.push({
        key: 'comparison',
        name: `Comp (${compLabelName})`,
        nameHi: 'तुलना',
        color: '#0ea5e9', // Sky Blue / Cyan
        strokeWidth: 2.4,
        strokeDash: '4 4', // Dashed reference line
        pointRadius: 4,
        gradId: null,
        active: visibleLines.comparison !== false,
        data: intervals.map((intv, idx) => {
          const v = intv.compIncome || 0;
          return { x: getX(idx), y: getY(v), val: v, label: intv.compLabel || intv.label };
        })
      });
    }

    const formatVal = (v) => {
      const abs = Math.abs(v);
      if (abs >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
      if (abs >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
      if (abs >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
      return `₹${Math.round(v)}`;
    };

    // 4 clean, evenly spaced grid levels
    const gridSteps = [0, 0.25, 0.5, 0.75, 1];
    const gridLines = gridSteps.map(step => {
      const v = minVal + step * range;
      const y = getY(v);
      return { y, label: formatVal(v), v };
    });

    // Fritsch-Carlson Monotone Cubic Spline (Guarantees zero overshoot/undershoot)
    const buildMonotonePath = (pts) => {
      if (!pts || pts.length === 0) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

      const n = pts.length;
      const deltas = [];
      for (let i = 0; i < n - 1; i++) {
        const dx = pts[i + 1].x - pts[i].x;
        const dy = pts[i + 1].y - pts[i].y;
        deltas.push(dx !== 0 ? dy / dx : 0);
      }

      const slopes = new Array(n);
      slopes[0] = deltas[0];
      slopes[n - 1] = deltas[n - 2];
      for (let i = 1; i < n - 1; i++) {
        if (deltas[i - 1] * deltas[i] <= 0) {
          // Local extrema -> zero tangent prevents artificial overshoot/dip
          slopes[i] = 0;
        } else {
          slopes[i] = (deltas[i - 1] + deltas[i]) / 2;
        }
      }

      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < n - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const dx = (p2.x - p1.x) / 3;
        const cp1x = p1.x + dx;
        const cp1y = p1.y + slopes[i] * dx;
        const cp2x = p2.x - dx;
        const cp2y = p2.y - slopes[i + 1] * dx;

        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        const clampedCp1y = Math.max(minY, Math.min(maxY, cp1y));
        const clampedCp2y = Math.max(minY, Math.min(maxY, cp2y));

        path += ` C ${cp1x.toFixed(1)} ${clampedCp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${clampedCp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return path;
    };

    const buildArea = (pts) => {
      if (!pts || pts.length === 0) return '';
      const curve = buildMonotonePath(pts);
      const lastX = pts[pts.length - 1].x;
      const firstX = pts[0].x;
      return `${curve} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
    };

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      zeroY,
      getX,
      getY,
      intervals,
      series,
      gridLines,
      buildMonotonePath,
      buildArea
    };
  }, [trendVm.chartIntervals, visibleLines]);

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

        {/* Section 1: Financial Performance Multi-Line Trend Chart */}
        <motion.div className="analytics-card trend-chart-card" variants={itemVariants}>
          <div className="analytics-card-header">
            <div>
              <div className="analytics-card-title">
                <TrendingUp size={20} color="#059669" /> Income, Expense, Net Profit & Net Balance Trends (आय, खर्च, शुद्ध लाभ एवं कुल बैलेंस)
              </div>
              <div className="analytics-card-subtitle">
                Clear performance across <strong>{trendVm.config.name}</strong> • {trendVm.config.periodLabel}
              </div>
            </div>

            {/* Timeframe & Custom Selection Controls: Month, Week & Comparison */}
            <div className="trend-header-controls">
              <div className="trend-tf-btn-group">
                <button
                  type="button"
                  className={`trend-tf-btn ${trendTf === 'weekly' ? 'active' : ''}`}
                  onClick={() => setTrendTf('weekly')}
                >
                  Week (साप्ताहिक)
                </button>
                <button
                  type="button"
                  className={`trend-tf-btn ${trendTf === 'monthly' ? 'active' : ''}`}
                  onClick={() => setTrendTf('monthly')}
                >
                  Month (मासिक)
                </button>
                <button
                  type="button"
                  className={`trend-tf-btn ${trendTf === 'daily' ? 'active' : ''}`}
                  onClick={() => setTrendTf('daily')}
                >
                  Day (दैनिक)
                </button>
              </div>

              {/* Selectors for Month, Week & Comparison */}
              <div className="trend-selectors-wrap">
                {/* Month Dropdown Selector */}
                <div className="trend-select-group" title="Select Month for analytics">
                  <label className="trend-select-label">Month:</label>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="trend-dropdown-select"
                  >
                    {availableMonths.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Week Dropdown Selector (Active when in weekly mode) */}
                {trendTf === 'weekly' && (
                  <div className="trend-select-group" title="Select specific week to view">
                    <label className="trend-select-label">Week:</label>
                    <select 
                      value={selectedWeek} 
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="trend-dropdown-select"
                    >
                      <option value="current">Current (Last 7 Days)</option>
                      <option value="prev">Previous 7 Days</option>
                      <option value="week3">Week 3 (15-21)</option>
                      <option value="week2">Week 2 (8-14)</option>
                      <option value="week1">Week 1 (1-7)</option>
                    </select>
                  </div>
                )}

                {/* Comparison Selector */}
                {trendTf === 'weekly' && (
                  <div className="trend-select-group comparison" title="Compare current week with selected week">
                    <label className="trend-select-label">Compare with:</label>
                    <select 
                      value={comparisonWeek} 
                      onChange={(e) => setComparisonWeek(e.target.value)}
                      className="trend-dropdown-select comparison-select"
                    >
                      <option value="prev">Previous Week</option>
                      <option value="week2">Week 2 (8-14)</option>
                      <option value="week1">Week 1 (1-7)</option>
                      <option value="none">None (Off)</option>
                    </select>
                  </div>
                )}

                {trendTf === 'monthly' && (
                  <div className="trend-select-group comparison" title="Compare with previous month">
                    <label className="trend-select-label">Compare with:</label>
                    <select 
                      value={comparisonMonth} 
                      onChange={(e) => setComparisonMonth(e.target.value)}
                      className="trend-dropdown-select comparison-select"
                    >
                      <option value="prev">Previous Month</option>
                      <option value="none">None (Off)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive KPI Summary Badges */}
          <div className="trend-kpi-summary-strip">
            <div 
              className={`trend-kpi-pill ${activeFocus === 'income' ? 'focused' : ''} ${!visibleLines.income ? 'disabled' : ''}`}
              onClick={() => setActiveFocus(prev => prev === 'income' ? null : 'income')}
              title="Click to highlight Income curve"
            >
              <div className="kpi-pill-header">
                <span className="kpi-pill-dot" style={{ background: '#10b981' }}></span>
                <span className="kpi-pill-label">Income (आय)</span>
              </div>
              <div className="kpi-pill-val" style={{ color: '#047857' }}>{fmt(trendTotals.income)}</div>
            </div>

            <div 
              className={`trend-kpi-pill ${activeFocus === 'expense' ? 'focused' : ''} ${!visibleLines.expense ? 'disabled' : ''}`}
              onClick={() => setActiveFocus(prev => prev === 'expense' ? null : 'expense')}
              title="Click to highlight Expense curve"
            >
              <div className="kpi-pill-header">
                <span className="kpi-pill-dot" style={{ background: '#ef4444' }}></span>
                <span className="kpi-pill-label">Expense (खर्च)</span>
              </div>
              <div className="kpi-pill-val" style={{ color: '#b91c1c' }}>{fmt(trendTotals.expense)}</div>
            </div>

            <div 
              className={`trend-kpi-pill ${activeFocus === 'netprofit' ? 'focused' : ''} ${!visibleLines.netprofit ? 'disabled' : ''}`}
              onClick={() => setActiveFocus(prev => prev === 'netprofit' ? null : 'netprofit')}
              title="Click to highlight Net Profit curve"
            >
              <div className="kpi-pill-header">
                <span className="kpi-pill-dot" style={{ background: '#2563eb' }}></span>
                <span className="kpi-pill-label">Net Profit (शुद्ध लाभ)</span>
              </div>
              <div className="kpi-pill-val" style={{ color: '#1d4ed8' }}>{fmt(trendTotals.netprofit)}</div>
            </div>

            <div 
              className={`trend-kpi-pill ${activeFocus === 'netBalanceTillDate' ? 'focused' : ''} ${!visibleLines.netBalanceTillDate ? 'disabled' : ''}`}
              onClick={() => setActiveFocus(prev => prev === 'netBalanceTillDate' ? null : 'netBalanceTillDate')}
              title="Click to highlight Net Balance Till Date curve"
            >
              <div className="kpi-pill-header">
                <span className="kpi-pill-dot" style={{ background: '#f59e0b' }}></span>
                <span className="kpi-pill-label">Net Balance Till Date (कुल बैलेंस)</span>
              </div>
              <div className="kpi-pill-val" style={{ color: '#b45309' }}>{fmt(trendTotals.netBalanceTillDate)}</div>
            </div>
          </div>

          {/* Clean, Premium SVG Chart (Zero Area Fill - Lines & Numbers Only) */}
          <div 
            className="svg-line-chart-container" 
            style={{ position: 'relative' }}
            onMouseLeave={() => setHoveredTrendIdx(null)}
          >
            {/* Detailed Point Breakdown Card (Shown ONLY when clicking on one of the dots) */}
            <AnimatePresence>
              {selectedPointIdx !== null && lineChartProps.intervals[selectedPointIdx] && (
                <motion.div
                  className="analytics-chart-tooltip trend-line-tooltip"
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    left: `${lineChartProps.getX(selectedPointIdx) < lineChartProps.width / 2
                      ? Math.min(lineChartProps.width - 245, lineChartProps.getX(selectedPointIdx) + 20)
                      : Math.max(lineChartProps.padLeft, lineChartProps.getX(selectedPointIdx) - 245)
                    }px`,
                    top: '12px',
                    pointerEvents: 'auto',
                    zIndex: 30,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="tt-title" style={{ fontWeight: 800, fontSize: 13, margin: 0 }}>
                      {lineChartProps.intervals[selectedPointIdx].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPointIdx(null)}
                      style={{
                        background: 'rgba(255,255,255,0.14)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: 0
                      }}
                      title="Close details (बंद करें)"
                    >
                      ✕
                    </button>
                  </div>
                  {lineChartProps.series.filter(s => s.active && s.key !== 'comparison').map(s => {
                    const pt = s.data[selectedPointIdx];
                    return (
                      <div key={s.key} className="tt-row">
                        <span style={{ color: s.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block' }}></span>
                          {s.name}:
                        </span>
                        <strong style={{ color: s.color }}>{fmt(pt ? pt.val : 0)}</strong>
                      </div>
                    );
                  })}
                  {/* Dedicated Comparison Line Info in Tooltip */}
                  {(() => {
                    const compS = lineChartProps.series.find(s => s.key === 'comparison' && s.active);
                    if (!compS) return null;
                    const compPt = compS.data[selectedPointIdx];
                    const incPt = (lineChartProps.series.find(s => s.key === 'income')?.data || [])[selectedPointIdx];
                    const curVal = incPt ? incPt.val : 0;
                    const compVal = compPt ? compPt.val : 0;
                    const diffPct = compVal > 0 ? Math.round(((curVal - compVal) / compVal) * 100) : (curVal > 0 ? 100 : 0);
                    return (
                      <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed rgba(255,255,255,0.18)' }}>
                        <div className="tt-row">
                          <span style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 2, background: '#0ea5e9', display: 'inline-block' }}></span>
                            {compPt?.label ? `Comp (${compPt.label})` : 'Comp Income'}:
                          </span>
                          <strong style={{ color: '#0ea5e9' }}>{fmt(compVal)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginTop: 4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Comparison Variance:</span>
                          <span style={{ color: diffPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {diffPct >= 0 ? `+${diffPct}% ▲` : `${diffPct}% ▼`}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            <svg 
              viewBox={`0 0 ${lineChartProps.width} ${lineChartProps.height}`} 
              preserveAspectRatio="xMidYMid meet"
              onMouseLeave={() => setHoveredTrendIdx(null)}
            >
              {/* Horizontal Grid Lines */}
              {lineChartProps.gridLines.map((gl, i) => (
                <g key={i}>
                  <line
                    x1={lineChartProps.padLeft}
                    y1={gl.y}
                    x2={lineChartProps.width - lineChartProps.padRight}
                    y2={gl.y}
                    stroke="var(--border-color)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <text
                    x={lineChartProps.padLeft - 12}
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
                x1={lineChartProps.padLeft}
                y1={lineChartProps.zeroY}
                x2={lineChartProps.width - lineChartProps.padRight}
                y2={lineChartProps.zeroY}
                stroke="var(--border-color)"
                strokeWidth="1.2"
                opacity="0.8"
              />

              {/* Render Clean Lines (Zero Area Fills) */}
              {lineChartProps.series.map(s => {
                if (!s.active) return null;
                const isDimmed = activeFocus && activeFocus !== s.key;
                const isFocused = activeFocus === s.key;
                return (
                  <path
                    key={`line-${s.key}`}
                    d={lineChartProps.buildMonotonePath(s.data)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={isFocused ? 3.5 : s.strokeWidth}
                    strokeDasharray={s.strokeDash || undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isDimmed ? 0.25 : 1}
                    filter={isFocused ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' : 'none'}
                    style={{ transition: 'all 0.25s ease' }}
                  />
                );
              })}

              {/* Vertical Selected / Hover Tracking Guideline */}
              {(selectedPointIdx !== null || hoveredTrendIdx !== null) && (
                <line
                  x1={lineChartProps.getX(selectedPointIdx !== null ? selectedPointIdx : hoveredTrendIdx)}
                  y1={lineChartProps.padTop}
                  x2={lineChartProps.getX(selectedPointIdx !== null ? selectedPointIdx : hoveredTrendIdx)}
                  y2={lineChartProps.zeroY}
                  stroke={selectedPointIdx !== null ? "var(--primary)" : "rgba(16, 185, 129, 0.5)"}
                  strokeDasharray={selectedPointIdx !== null ? "4 2" : "3 3"}
                  strokeWidth={selectedPointIdx !== null ? "2" : "1.5"}
                  opacity="0.8"
                />
              )}

              {/* Data Point Markers (Click any dot to open detailed breakdown card) */}
              {lineChartProps.series.map(s => {
                if (!s.active) return null;
                const isDimmed = activeFocus && activeFocus !== s.key;
                return (
                  <g key={`dots-${s.key}`} opacity={isDimmed ? 0.25 : 1}>
                    {s.data.map((pt, idx) => {
                      const isSelected = selectedPointIdx === idx;
                      const isHovered = hoveredTrendIdx === idx;
                      const r = isSelected 
                        ? (s.pointRadius ? s.pointRadius + 3 : 7) 
                        : (isHovered ? (s.pointRadius ? s.pointRadius + 2 : 6) : (s.pointRadius || 4));
                      return (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={r}
                          fill={s.color}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 2.8 : (isHovered ? 2 : 1.2)}
                          style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPointIdx(prev => prev === idx ? null : idx);
                          }}
                          onMouseEnter={() => setHoveredTrendIdx(idx)}
                          onMouseMove={() => setHoveredTrendIdx(idx)}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Exact Numerical Data Value Labels for Each Point & Each Line (ALWAYS VISIBLE) */}
              {lineChartProps.intervals.map((intv, idx) => {
                // Collect active points with visible data for this column
                const ptsAtIdx = [];
                lineChartProps.series.forEach(s => {
                  if (!s.active) return;
                  const pt = s.data[idx];
                  if (!pt) return;

                  // Show if value > 0, or if currently focused on this specific line
                  const shouldShow = pt.val > 0 || (activeFocus === s.key);
                  if (!shouldShow) return;

                  let textColor = s.color;
                  if (s.key === 'income') textColor = '#047857';
                  else if (s.key === 'expense') textColor = '#dc2626';
                  else if (s.key === 'netprofit') textColor = '#1d4ed8';
                  else if (s.key === 'netBalanceTillDate') textColor = '#b45309';
                  else if (s.key === 'comparison') textColor = '#0284c7';

                  ptsAtIdx.push({
                    key: s.key,
                    name: s.name,
                    val: pt.val,
                    x: pt.x,
                    y: pt.y,
                    color: s.color,
                    textColor,
                    isFocused: activeFocus === s.key,
                    isDimmed: activeFocus && activeFocus !== s.key
                  });
                });

                if (ptsAtIdx.length === 0) return null;

                // Smart Cluster-Based Vertical Positioning:
                // Sort from top of chart (lowest y) to bottom of chart (highest y)
                const sorted = [...ptsAtIdx].sort((a, b) => a.y - b.y);

                // Cluster points that are close to each other (within 16px)
                const clusters = [];
                let currentCluster = [sorted[0]];
                for (let i = 1; i < sorted.length; i++) {
                  const prev = sorted[i - 1];
                  const cur = sorted[i];
                  if (cur.y - prev.y <= 16) {
                    currentCluster.push(cur);
                  } else {
                    clusters.push(currentCluster);
                    currentCluster = [cur];
                  }
                }
                clusters.push(currentCluster);

                // Assign clean non-overlapping labelY coordinates
                const positionedLabels = [];
                clusters.forEach(cluster => {
                  if (cluster.length === 1) {
                    cluster[0].labelY = cluster[0].y - 10;
                    positionedLabels.push(cluster[0]);
                  } else if (cluster.length === 2) {
                    const isNearBaseline = cluster[1].y >= lineChartProps.zeroY - 24;
                    if (!isNearBaseline) {
                      cluster[0].labelY = cluster[0].y - 10;
                      cluster[1].labelY = cluster[1].y + 16;
                    } else {
                      cluster[0].labelY = cluster[0].y - 24;
                      cluster[1].labelY = cluster[1].y - 10;
                    }
                    positionedLabels.push(...cluster);
                  } else {
                    const isNearBaseline = cluster[cluster.length - 1].y >= lineChartProps.zeroY - 24;
                    cluster[0].labelY = cluster[0].y - 25;
                    cluster[1].labelY = cluster[1].y - 10;
                    if (!isNearBaseline) {
                      cluster[2].labelY = cluster[2].y + 16;
                    } else {
                      cluster[2].labelY = cluster[0].y - 39;
                    }
                    for (let k = 3; k < cluster.length; k++) {
                      cluster[k].labelY = cluster[k].y + 16 + (k - 2) * 14;
                    }
                    positionedLabels.push(...cluster);
                  }
                });

                // Clamp top so labels never clip outside the chart viewBox
                positionedLabels.forEach(item => {
                  item.labelY = Math.max(lineChartProps.padTop - 12, item.labelY);
                });

                return (
                  <g key={`data-labels-col-${idx}`}>
                    {positionedLabels.map(lbl => {
                      const isSelected = selectedPointIdx === idx;
                      const isHovered = hoveredTrendIdx === idx;
                      return (
                        <text
                          key={`lbl-${lbl.key}-${idx}`}
                          x={lbl.x}
                          y={lbl.labelY}
                          textAnchor="middle"
                          fill={lbl.textColor}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? "4.2" : "3.6"}
                          strokeLinejoin="round"
                          paintOrder="stroke fill"
                          fontSize={isSelected ? "12" : (isHovered ? "11.5" : "11")}
                          fontWeight={isSelected ? "900" : "800"}
                          opacity={lbl.isDimmed ? 0.25 : 1}
                          style={{
                            pointerEvents: 'none',
                            userSelect: 'none',
                            transition: 'opacity 0.2s ease, font-size 0.15s ease'
                          }}
                        >
                          {fmt(lbl.val)}
                        </text>
                      );
                    })}
                  </g>
                );
              })}

              {/* X Axis Interval Labels */}
              {lineChartProps.intervals.map((intv, idx) => {
                const x = lineChartProps.getX(idx);
                const isSelected = selectedPointIdx === idx;
                const isHovered = hoveredTrendIdx === idx;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={lineChartProps.height - 14}
                    textAnchor="middle"
                    fill={isSelected ? 'var(--primary)' : (isHovered ? 'var(--text-primary)' : 'var(--text-secondary)')}
                    fontSize={isSelected ? "12" : "11.5"}
                    fontWeight={isSelected ? '800' : (isHovered ? '700' : '600')}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPointIdx(prev => prev === idx ? null : idx)}
                  >
                    {intv.label}
                  </text>
                );
              })}

              {/* Interactive Hover & Click Catcher Slices */}
              {lineChartProps.intervals.map((intv, idx) => {
                const colW = lineChartProps.intervals.length > 1
                  ? lineChartProps.plotW / (lineChartProps.intervals.length - 1)
                  : lineChartProps.plotW;
                const colX = lineChartProps.getX(idx) - colW / 2;
                return (
                  <rect
                    key={idx}
                    x={Math.max(lineChartProps.padLeft, colX)}
                    y={lineChartProps.padTop}
                    width={colW}
                    height={lineChartProps.plotH + 30}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPointIdx(prev => prev === idx ? null : idx);
                    }}
                    onMouseEnter={() => setHoveredTrendIdx(idx)}
                    onMouseMove={() => setHoveredTrendIdx(idx)}
                    onMouseLeave={() => setHoveredTrendIdx(null)}
                    onTouchStart={() => setSelectedPointIdx(prev => prev === idx ? null : idx)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Clean Legend Toggles */}
          <div className="trend-lines-legend">
            {lineChartProps.series.map(s => (
              <button
                key={s.key}
                type="button"
                className={`trend-legend-pill ${s.active ? 'active' : 'inactive'}`}
                style={{ '--pill-color': s.color }}
                onClick={() => setVisibleLines(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
              >
                <span 
                  className="trend-legend-swatch-line" 
                  style={{ display: 'inline-flex', alignItems: 'center', width: 22, height: 10 }}
                >
                  <svg width="22" height="10" viewBox="0 0 22 10">
                    <line 
                      x1="1" y1="5" x2="21" y2="5" 
                      stroke={s.active ? s.color : 'var(--text-muted)'} 
                      strokeWidth={s.strokeWidth >= 3.5 ? 3.5 : 2.5} 
                      strokeDasharray={s.strokeDash || undefined} 
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="trend-legend-text">{s.name} ({s.nameHi})</span>
                <span className="trend-legend-status">{s.active ? 'VISIBLE' : 'HIDDEN'}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section 2: Period Comparison Value Cards Grid (Picture 2) responding dynamically to Day / Week / Month */}
        <motion.div className="analytics-card comparison-chart-section" variants={itemVariants}>
          <div className="analytics-card-header">
            <div>
              <div className="analytics-card-title">
                <Scale size={19} color="#8b5cf6" /> Financial Metrics Comparison — {trendVm.config.name}
              </div>
              <div className="analytics-card-subtitle">
                Comparing <strong>{trendVm.config.periodLabel}</strong> (Current) vs <strong>{trendVm.previousPeriodLabel}</strong> (Previous)
              </div>
            </div>
            <div className="comp-timeframe-tag">
              <span>● Showing {trendTf === 'daily' ? 'Day-over-Day' : trendTf === 'weekly' ? 'Week-over-Week' : 'Month-over-Month'} Comparison</span>
            </div>
          </div>

          {/* Comparison Value Cards Grid (Picture 2) */}
          <div className="comparison-values-grid">
            {(trendVm.comparisonBars || []).map((bar, idx) => {
              const changePct = bar.previous !== 0
                ? Math.round(((bar.current - bar.previous) / Math.abs(bar.previous)) * 100)
                : (bar.current > 0 ? 100 : 0);
              const isUp = changePct >= 0;
              return (
                <div key={idx} className="comparison-value-card" style={{ '--comp-accent': bar.color }}>
                  <div className="comp-val-header">
                    <span className="comp-val-label">{bar.label}</span>
                    <span className={`comp-change-badge ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '↑' : '↓'} {Math.abs(changePct)}%
                    </span>
                  </div>
                  <div className="comp-val-row">
                    <div className="comp-val-block current">
                      <span className="comp-val-tag">Current</span>
                      <span className="comp-val-amount">{fmt(bar.current)}</span>
                    </div>
                    <div className="comp-val-divider"></div>
                    <div className="comp-val-block previous">
                      <span className="comp-val-tag">Previous</span>
                      <span className="comp-val-amount">{fmt(bar.previous)}</span>
                    </div>
                  </div>
                  <div className="comp-mini-bar-track">
                    <motion.div className="comp-mini-bar-current"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(bar.current, bar.previous) > 0 ? (Math.abs(bar.current) / Math.max(Math.abs(bar.current), Math.abs(bar.previous))) * 100 : 0)}%` }}
                      style={{ background: bar.color }}
                    />
                    <motion.div className="comp-mini-bar-previous"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(bar.current, bar.previous) > 0 ? (Math.abs(bar.previous) / Math.max(Math.abs(bar.current), Math.abs(bar.previous))) * 100 : 0)}%` }}
                      style={{ background: bar.color, opacity: 0.3 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Counts Comparison Row */}
          <div className="comparison-stats-strip">
            <div className="comp-strip-title">
              <Users size={15} color="#059669" /> Activity Counts Comparison
            </div>
            <div className="comp-stats-row">
              {(trendVm.comparisonStats || []).map((stat, idx) => {
                const diff = stat.current - stat.previous;
                const isUp = diff >= 0;
                return (
                  <div key={idx} className="comp-stat-cell">
                    <span className="comp-stat-label">{stat.label}</span>
                    <div className="comp-stat-values">
                      <span className="comp-stat-cur">{stat.isPercent ? `${stat.current}%` : stat.current}</span>
                      <span className="comp-stat-vs">vs</span>
                      <span className="comp-stat-prev">{stat.isPercent ? `${stat.previous}%` : stat.previous}</span>
                    </div>
                    <span className={`comp-stat-delta ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '+' : ''}{stat.isPercent ? `${diff}pp` : diff}
                    </span>
                  </div>
                );
              })}
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
