// Real-Time Business Intelligence & Summary Stats Engine for Maa Durga Engineering OS
// Computes 100% dynamic analytics strictly from actual store collections (Bills, Expenses, Cash Ledger, Quotes, Leads, Demos, Tractors)
// ZERO hardcoded or simulated values.

import { formatToDMY } from './utils/dateUtils.js';

// Helper: Parse DD-MM-YYYY, DD/MM/YYYY, or ISO date string into a Date object
function parseItemDate(dateInput) {
  if (!dateInput) return null;
  const str = String(dateInput).trim();
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
    const [d, m, y] = str.split(/[-/]/);
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Helper: Check if an item's date falls within the selected timeframe
function isDateInTimeframe(itemDate, tf) {
  if (!itemDate) return true; // If no date, include in general aggregation
  const now = new Date();

  if (tf === 'daily') {
    return (
      itemDate.getDate() === now.getDate() &&
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    );
  }

  if (tf === 'weekly') {
    const diffMs = now.getTime() - itemDate.getTime();
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  }

  if (tf === 'monthly') {
    return (
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    );
  }

  if (tf === 'yearly') {
    return itemDate.getFullYear() === now.getFullYear();
  }

  return true;
}

export function getAnalyticsViewModel(timeframe = 'monthly', store) {
  const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly'];
  const tf = validTimeframes.includes(timeframe) ? timeframe : 'monthly';

  // 1. Fetch live collections from DealershipStore
  const bills = (store && typeof store.getBills === 'function') ? store.getBills() : [];
  const expenses = (store && typeof store.getExpenses === 'function') ? store.getExpenses() : [];
  const cashTxns = (store && typeof store.getCashTransactions === 'function') ? store.getCashTransactions() : [];
  const leads = (store && typeof store.getLeads === 'function') ? store.getLeads() : [];
  const demos = (store && typeof store.getDemos === 'function') ? store.getDemos() : [];
  const tractors = (store && typeof store.getTractors === 'function') ? store.getTractors() : [];
  const quotes = (store && typeof store.getQuotes === 'function') ? store.getQuotes() : [];

  // 2. Filter collections strictly by selected timeframe
  const periodBills = bills.filter(b => isDateInTimeframe(parseItemDate(b.date), tf));
  const periodExpenses = expenses.filter(e => isDateInTimeframe(parseItemDate(e.date), tf));
  const periodCashTxns = cashTxns.filter(t => isDateInTimeframe(parseItemDate(t.date), tf));
  const periodLeads = leads.filter(l => isDateInTimeframe(parseItemDate(l.lastContactDate || l.createdAt), tf));
  const periodDemos = demos.filter(d => isDateInTimeframe(parseItemDate(d.date), tf));
  const periodQuotes = quotes.filter(q => isDateInTimeframe(parseItemDate(q.date), tf));

  // Approved expenses only for financial calculations
  const approvedExpenses = periodExpenses.filter(e => e.status === 'Approved');

  // 3. Compute Real Billing & Invoicing Totals
  const billsCount = periodBills.length;
  const billedRupees = periodBills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
  const paidRupees = periodBills.reduce((sum, b) => {
    const tot = Number(b.totalRupees || 0);
    if (b.paymentStatus === 'Due') return sum;
    if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
      return sum + Math.min(tot, Math.max(0, Number(b.paidAmount) || 0));
    }
    return sum + (b.paidAmount ? Number(b.paidAmount) : tot);
  }, 0);
  const dueRupees = Math.max(0, billedRupees - paidRupees);
  const collectionRate = billedRupees > 0 ? Math.round((paidRupees / billedRupees) * 100) : (billsCount > 0 ? 100 : 0);

  // 4. Compute Real Quotes & Machinery Revenue
  const quoteRevenue = periodQuotes.reduce((sum, q) => sum + Number(q.grandTotal || 0), 0);

  // 5. Compute Real Cash Flow
  const cashIn = periodCashTxns
    .filter(t => t.type === 'IN')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const cashOut = periodCashTxns
    .filter(t => t.type === 'OUT')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netCashFlow = cashIn - cashOut;

  // 6. Compute Real Showroom Operating Expenses
  const totalExpenses = approvedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // 7. Overall Sales Turnover (Revenue)
  // Real sales from bills + quotes (or cashIn if bills/quotes not yet made)
  const revenue = Math.max(quoteRevenue + billedRupees, cashIn);

  // 8. Cost of Goods Sold (COGS) & Gross Profit
  let costOfGoodsSold = 0;
  for (const q of periodQuotes) {
    const tr = tractors.find(t => t.id === q.tractorId || t.model === q.tractorModel || (q.tractorName && q.tractorName.includes(t.model)));
    if (tr && tr.dealerPurchaseCost) {
      costOfGoodsSold += Number(tr.dealerPurchaseCost);
    }
  }
  const grossProfit = Math.max(0, revenue - costOfGoodsSold);
  const netProfit = grossProfit - totalExpenses;
  const netMarginPct = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0.0';

  // 9. Operations Counts
  const inStockUnits = tractors.reduce((sum, t) => sum + (Number(t.stockCount) || 0), 0);
  const totalLeads = periodLeads.length;
  const totalDemos = periodDemos.length;
  const totalQuotes = periodQuotes.length;
  const tractorsDelivered = periodQuotes.filter(q => q.status === 'Delivered' || q.status === 'Closed' || q.delivered === true).length +
    periodBills.filter(b => b.vehicle || (b.items && b.items.some(i => (i.description || '').toLowerCase().includes('tractor')))).length;

  // 10. Timeframe Metadata & Display Labels
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const configs = {
    daily: {
      name: 'Daily (दैनिक)',
      periodLabel: `Today (${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()})`
    },
    weekly: {
      name: 'Weekly (साप्ताहिक)',
      periodLabel: 'Last 7 Days'
    },
    monthly: {
      name: 'Monthly (मासिक)',
      periodLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()} (${monthNamesHi[now.getMonth()]})`
    },
    yearly: {
      name: 'Yearly (वार्षिक)',
      periodLabel: `Year ${now.getFullYear()}`
    }
  };

  const conf = configs[tf];

  // Helper: Extract hour from item timestamp if available
  function getItemHour(item) {
    if (!item) return null;
    const candidates = [item.createdAt, item.timestamp, item.time, item.date];
    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === 'string' && c.includes(':')) {
        const timeMatch = c.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const h = parseInt(timeMatch[1], 10);
          if (!isNaN(h) && h >= 0 && h <= 23) return h;
        }
      }
      const d = new Date(c);
      if (!isNaN(d.getTime()) && (typeof c === 'string' && (c.includes('T') || c.includes(':')))) {
        return d.getHours();
      }
    }
    return null;
  }

  // 11. Real Time-Series Intervals for Bar & Trend Chart
  let chartIntervals = [];

  if (tf === 'daily') {
    const buckets = [
      { label: '08:00 - 10:00', start: 8, end: 10 },
      { label: '10:00 - 12:00', start: 10, end: 12 },
      { label: '12:00 - 14:00', start: 12, end: 14 },
      { label: '14:00 - 16:00', start: 14, end: 16 },
      { label: '16:00 - 18:00', start: 16, end: 18 },
      { label: '18:00 - 20:00', start: 18, end: 20 }
    ];

    chartIntervals = buckets.map(b => {
      const bBills = periodBills.filter(bill => {
        const h = getItemHour(bill);
        return h !== null ? (h >= b.start && h < b.end) : false;
      });
      const bQuotes = periodQuotes.filter(quote => {
        const h = getItemHour(quote);
        return h !== null ? (h >= b.start && h < b.end) : false;
      });
      const bExpenses = approvedExpenses.filter(exp => {
        const h = getItemHour(exp);
        return h !== null ? (h >= b.start && h < b.end) : false;
      });

      const intvRev = bBills.reduce((s, bill) => s + Number(bill.totalRupees || 0), 0) +
                      bQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const intvExp = bExpenses.reduce((s, exp) => s + Number(exp.amount || 0), 0);

      return {
        label: b.label,
        revenue: intvRev,
        expense: intvExp,
        net: intvRev - intvExp
      };
    });

    // If items had no hourly timestamps, attribute to first business bucket rather than losing data
    const totalBucketedRev = chartIntervals.reduce((s, i) => s + i.revenue, 0);
    const totalBucketedExp = chartIntervals.reduce((s, i) => s + i.expense, 0);
    if (totalBucketedRev === 0 && revenue > 0) {
      chartIntervals[1].revenue = revenue;
      chartIntervals[1].net += revenue;
    }
    if (totalBucketedExp === 0 && totalExpenses > 0) {
      chartIntervals[1].expense = totalExpenses;
      chartIntervals[1].net -= totalExpenses;
    }
  } else if (tf === 'weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    chartIntervals = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = `${days[d.getDay()]} (${d.getDate()})`;
      const dayBills = periodBills.filter(b => {
        const bd = parseItemDate(b.date);
        return bd && bd.getDate() === d.getDate() && bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      const dayExp = approvedExpenses.filter(e => {
        const ed = parseItemDate(e.date);
        return ed && ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      });
      const dayQuotes = periodQuotes.filter(q => {
        const qd = parseItemDate(q.date);
        return qd && qd.getDate() === d.getDate() && qd.getMonth() === d.getMonth() && qd.getFullYear() === d.getFullYear();
      });

      const dayRev = dayBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
        dayQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const dayExpenses = dayExp.reduce((s, e) => s + Number(e.amount || 0), 0);

      chartIntervals.push({
        label: dayLabel,
        revenue: dayRev,
        expense: dayExpenses,
        net: dayRev - dayExpenses
      });
    }
  } else if (tf === 'monthly') {
    const weeks = [
      { label: 'Week 1 (1-7)', startDay: 1, endDay: 7 },
      { label: 'Week 2 (8-14)', startDay: 8, endDay: 14 },
      { label: 'Week 3 (15-21)', startDay: 15, endDay: 21 },
      { label: 'Week 4 (22-31)', startDay: 22, endDay: 31 }
    ];
    chartIntervals = weeks.map(w => {
      const wBills = periodBills.filter(b => {
        const d = parseItemDate(b.date);
        return d && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
      });
      const wExp = approvedExpenses.filter(e => {
        const d = parseItemDate(e.date);
        return d && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
      });
      const wQuotes = periodQuotes.filter(q => {
        const d = parseItemDate(q.date);
        return d && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
      });

      const wRev = wBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
        wQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const wExpenses = wExp.reduce((s, e) => s + Number(e.amount || 0), 0);

      return {
        label: w.label,
        revenue: wRev,
        expense: wExpenses,
        net: wRev - wExpenses
      };
    });
  } else {
    // Yearly: 12 months
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    chartIntervals = monthShorts.map((mName, mIdx) => {
      const mBills = periodBills.filter(b => {
        const d = parseItemDate(b.date);
        return d && d.getMonth() === mIdx;
      });
      const mExp = approvedExpenses.filter(e => {
        const d = parseItemDate(e.date);
        return d && d.getMonth() === mIdx;
      });
      const mQuotes = periodQuotes.filter(q => {
        const d = parseItemDate(q.date);
        return d && d.getMonth() === mIdx;
      });

      const mRev = mBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
        mQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const mExpenses = mExp.reduce((s, e) => s + Number(e.amount || 0), 0);

      return {
        label: mName,
        revenue: mRev,
        expense: mExpenses,
        net: mRev - mExpenses
      };
    });
  }

  // 12. Real Revenue Categories Donut (NO FAKE PERCENTAGES)
  // Derived from actual bills & quotes
  const revMap = {};
  if (periodBills.length > 0) {
    periodBills.forEach(b => {
      const desc = (b.items && b.items.length > 0 && b.items[0].description) ? b.items[0].description : 'Diesel & Retail Memos';
      revMap[desc] = (revMap[desc] || 0) + Number(b.totalRupees || 0);
    });
  }
  if (periodQuotes.length > 0) {
    periodQuotes.forEach(q => {
      const desc = q.tractorModel || q.tractorName || 'VST Zetor Tractor Sales';
      revMap[desc] = (revMap[desc] || 0) + Number(q.grandTotal || 0);
    });
  }

  const PALETTE_REV = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
  const revenueCategories = Object.entries(revMap).map(([label, val], idx) => {
    const pct = revenue > 0 ? Math.round((val / revenue) * 100) : 0;
    return {
      label,
      value: val,
      pct,
      color: PALETTE_REV[idx % PALETTE_REV.length]
    };
  });

  // 13. Real Expense Categories Donut (NO FAKE 38%, 26%)
  // Derived strictly from actual approved expenses
  const expMap = {};
  approvedExpenses.forEach(e => {
    const cat = e.category || 'General Overheads';
    expMap[cat] = (expMap[cat] || 0) + Number(e.amount || 0);
  });

  const PALETTE_EXP = ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#6366f1', '#a855f7'];
  const expenseCategories = Object.entries(expMap).map(([label, val], idx) => {
    const pct = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
    return {
      label,
      value: val,
      pct,
      color: PALETTE_EXP[idx % PALETTE_EXP.length]
    };
  });

  // 14. Real Tractor Models Leaderboard
  // Based strictly on actual quotes & sales in the selected period
  const modelActivity = {};
  periodQuotes.forEach(q => {
    const name = q.tractorModel || q.tractorName || 'VST Zetor Tractor';
    if (!modelActivity[name]) modelActivity[name] = { units: 0, rev: 0 };
    modelActivity[name].units += 1;
    modelActivity[name].rev += Number(q.grandTotal || 0);
  });

  let topModels = [];
  if (Object.keys(modelActivity).length > 0) {
    const totalModelUnits = Object.values(modelActivity).reduce((s, m) => s + m.units, 0);
    topModels = Object.entries(modelActivity).map(([model, data], idx) => ({
      model,
      units: data.units,
      rev: data.rev,
      pct: totalModelUnits > 0 ? Math.round((data.units / totalModelUnits) * 100) : 0,
      color: PALETTE_REV[idx % PALETTE_REV.length]
    }));
  }

  // 15. Real Territory Villages Ranking
  // Based strictly on actual customer villages in leads, demos, and bills
  const villageMap = {};
  periodLeads.forEach(l => {
    if (l.village && l.village.trim() && l.village !== '-') {
      const v = l.village.trim();
      if (!villageMap[v]) villageMap[v] = { deals: 0, leads: 0, vol: 0 };
      villageMap[v].leads += 1;
      villageMap[v].vol += Number(l.budgetMax || 0);
    }
  });
  periodDemos.forEach(d => {
    if (d.village && d.village.trim() && d.village !== '-') {
      const v = d.village.trim();
      if (!villageMap[v]) villageMap[v] = { deals: 0, leads: 0, vol: 0 };
      villageMap[v].deals += 1;
    }
  });
  periodBills.forEach(b => {
    if (b.address && b.address.trim()) {
      const v = b.address.trim().split(',')[0].trim();
      if (v) {
        if (!villageMap[v]) villageMap[v] = { deals: 0, leads: 0, vol: 0 };
        villageMap[v].deals += 1;
        villageMap[v].vol += Number(b.totalRupees || 0);
      }
    }
  });

  const sortedVillages = Object.entries(villageMap)
    .sort((a, b) => (b[1].deals * 10 + b[1].leads) - (a[1].deals * 10 + a[1].leads))
    .slice(0, 5);

  const totalVillageVolume = sortedVillages.reduce((s, [, d]) => s + d.vol, 0);

  const topVillages = sortedVillages.map(([village, data]) => ({
    village,
    deals: data.deals || data.leads,
    vol: data.vol,
    pct: totalVillageVolume > 0 ? Math.round((data.vol / totalVillageVolume) * 100) : 0
  }));

  // 16. Dynamic Conversion Funnel Steps (Strictly Real Data)
  const funnelSteps = [
    { 
      step: '1', 
      label: 'Farmer Inquiries', 
      count: `${totalLeads} Leads`, 
      pct: totalLeads > 0 ? 100 : 0, 
      bg: '#3b82f6' 
    },
    { 
      step: '2', 
      label: 'Field Demonstrations', 
      count: `${totalDemos} Demos`, 
      pct: totalLeads > 0 ? Math.min(100, Math.round((totalDemos / totalLeads) * 100)) : (totalDemos > 0 ? 100 : 0), 
      bg: '#06b6d4' 
    },
    { 
      step: '3', 
      label: 'Quotation / Bank Appraisal', 
      count: `${totalQuotes} Quotes`, 
      pct: totalLeads > 0 ? Math.min(100, Math.round((totalQuotes / totalLeads) * 100)) : (totalQuotes > 0 ? 100 : 0), 
      bg: '#f59e0b' 
    },
    { 
      step: '4', 
      label: 'Delivered & Billed Orders', 
      count: `${billsCount + tractorsDelivered} Orders`, 
      pct: totalLeads > 0 ? Math.min(100, Math.round(((billsCount + tractorsDelivered) / totalLeads) * 100)) : (billsCount + tractorsDelivered > 0 ? 100 : 0), 
      bg: '#10b981' 
    }
  ];

  // 17. Real Statement Table Rows
  const statementRows = [
    {
      activity: 'VST Zetor Tractor Sales',
      category: 'Machinery & Quotations',
      volume: `${totalQuotes} Quotes (${tractorsDelivered} Delivered)`,
      inflow: quoteRevenue,
      outflow: costOfGoodsSold,
      net: quoteRevenue - costOfGoodsSold,
      status: tractorsDelivered > 0 ? 'Delivered' : (totalQuotes > 0 ? 'Quoted' : 'No Activity'),
      statusBadge: tractorsDelivered > 0 ? 'badge-success' : 'badge-gold'
    },
    {
      activity: 'Maa Durga Diesel & Retail Bills',
      category: 'Invoices & Cash Memos',
      volume: `${billsCount} Bills`,
      inflow: paidRupees,
      outflow: dueRupees,
      net: paidRupees,
      status: dueRupees === 0 && billsCount > 0 ? 'Settled' : (dueRupees > 0 ? 'Pending Dues' : 'No Bills'),
      statusBadge: dueRupees === 0 && billsCount > 0 ? 'badge-success' : 'badge-hot'
    },
    {
      activity: 'Showroom Overheads & Running Costs',
      category: 'Operating Expenses',
      volume: `${approvedExpenses.length} Vouchers`,
      inflow: 0,
      outflow: totalExpenses,
      net: -totalExpenses,
      status: approvedExpenses.length > 0 ? 'Approved' : 'None',
      statusBadge: 'badge-hot'
    },
    {
      activity: 'Showroom Cash Counter Flow',
      category: 'Cash In / Out Ledger',
      volume: `${periodCashTxns.length} Entries`,
      inflow: cashIn,
      outflow: cashOut,
      net: netCashFlow,
      status: periodCashTxns.length > 0 ? 'Reconciled' : 'No Flow',
      statusBadge: 'badge-blue'
    }
  ];

  return {
    timeframe: tf,
    config: conf,
    revenue,
    quoteRevenue,
    grossProfit,
    totalExpenses,
    netProfit,
    netMarginPct,
    cashIn,
    cashOut,
    netCashFlow,
    billsCount,
    scaledBilledRupees: billedRupees,
    scaledPaidRupees: paidRupees,
    scaledDueRupees: dueRupees,
    collectionRate,
    totalLeads,
    totalDemos,
    totalQuotes,
    tractorsDelivered,
    inStockUnits,
    approvedExpensesCount: approvedExpenses.length,
    cashTxnCount: periodCashTxns.length,
    chartIntervals,
    revenueCategories,
    expenseCategories,
    topModels,
    topVillages,
    funnelSteps,
    statementRows,
    cogs: costOfGoodsSold
  };
}

// Generate Mathematical SVG Bar & Trend Chart with Real Visual Scaling
export function renderBarChartSVG(intervals) {
  const width = 760;
  const height = 260;
  const padLeft = 65;
  const padRight = 25;
  const padTop = 30;
  const padBottom = 40;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(...intervals.map(i => Math.max(i.revenue, i.expense, 1000))) * 1.18;

  const numBuckets = Math.max(1, intervals.length);
  const slotW = chartW / numBuckets;
  const barW = Math.max(14, Math.min(28, slotW * 0.32));
  const gap = 5;

  // Grid Lines
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];
  const gridLines = gridSteps.map(step => {
    const y = padTop + chartH - (step * chartH);
    const val = Math.round(step * maxVal);
    let label = val >= 10000000 ? `₹${(val / 10000000).toFixed(1)}Cr` :
                val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` :
                val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`;
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" class="chart-grid-line" stroke="var(--border-color)" stroke-dasharray="4 4" stroke-width="1" />
      <text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" class="chart-axis-text" fill="var(--text-muted)" font-size="11" font-weight="600">${label}</text>
    `;
  }).join('');

  // Bars & Net Profit Line points
  const points = [];
  const bars = intervals.map((intv, idx) => {
    const centerX = padLeft + idx * slotW + slotW / 2;
    const revH = (intv.revenue / maxVal) * chartH;
    const expH = (intv.expense / maxVal) * chartH;
    const revY = padTop + chartH - revH;
    const expY = padTop + chartH - expH;
    const revX = centerX - barW - gap / 2;
    const expX = centerX + gap / 2;

    const netY = padTop + chartH - (Math.max(0, intv.net) / maxVal) * chartH;
    points.push({ x: centerX, y: netY, intv, idx });

    const revTooltip = `Turnover: ₹${intv.revenue.toLocaleString('en-IN')}`;
    const expTooltip = `Expenses: ₹${intv.expense.toLocaleString('en-IN')}`;

    return `
      <g class="chart-column-group" data-interval="${idx}">
        <rect x="${centerX - slotW/2 + 2}" y="${padTop}" width="${slotW - 4}" height="${chartH}" rx="8" fill="var(--primary)" opacity="0" class="chart-column-highlight" style="transition: opacity 0.2s ease;">
          <title>${intv.label} | Turnover: ₹${intv.revenue.toLocaleString('en-IN')} | Expenses: ₹${intv.expense.toLocaleString('en-IN')} | Net: ₹${intv.net.toLocaleString('en-IN')}</title>
        </rect>
        <rect x="${revX}" y="${revY}" width="${barW}" height="${revH}" rx="5" fill="url(#revGrad)" class="chart-bar-rect">
          <title>${intv.label} - ${revTooltip}</title>
        </rect>
        <rect x="${expX}" y="${expY}" width="${barW}" height="${expH}" rx="5" fill="url(#expGrad)" class="chart-bar-rect">
          <title>${intv.label} - ${expTooltip}</title>
        </rect>
        <text x="${centerX}" y="${height - 12}" text-anchor="middle" class="chart-axis-text" fill="var(--text-secondary)" font-size="11.5" font-weight="700">${intv.label}</text>
      </g>
    `;
  }).join('');

  // Net Profit Line & Smooth Area Fill
  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const firstPt = points[0] || { x: padLeft, y: padTop + chartH };
  const lastPt = points[points.length - 1] || { x: width - padRight, y: padTop + chartH };
  const baselineY = padTop + chartH;
  const areaPathStr = points.length > 0 
    ? `M ${firstPt.x},${baselineY} L ${polylineStr} L ${lastPt.x},${baselineY} Z`
    : '';

  const nodes = points.map(pt => {
    const netVal = pt.intv.net;
    return `
      <g class="chart-trend-node" style="cursor: pointer;">
        <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" filter="url(#nodeShadow)">
          <title>${pt.intv.label} Net Profit: ₹${netVal.toLocaleString('en-IN')}</title>
        </circle>
        <circle cx="${pt.x}" cy="${pt.y}" r="2.5" fill="#ffffff" />
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="60%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>
        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fb7185" />
          <stop offset="60%" stop-color="#f43f5e" />
          <stop offset="100%" stop-color="#be123c" />
        </linearGradient>
        <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
        </linearGradient>
        <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1d4ed8" flood-opacity="0.4" />
        </filter>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#2563eb" flood-opacity="0.35" />
        </filter>
      </defs>

      ${gridLines}
      <line x1="${padLeft}" y1="${baselineY}" x2="${width - padRight}" y2="${baselineY}" stroke="var(--border-color)" stroke-width="1.5" />
      ${bars}
      ${areaPathStr ? `<path d="${areaPathStr}" fill="url(#profitAreaGrad)" />` : ''}
      <polyline fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylineStr}" filter="url(#lineGlow)" />
      ${nodes}
    </svg>
  `;
}

// Generate Mathematical SVG Donut Slices with Glowing Curves
export function renderDonutSVG(categories, centerValText, centerLabelText) {
  const C = 439.82; // 2 * PI * 70
  let cumulativeOffset = 0;

  const circles = (categories && categories.length > 0) ? categories.map((cat, i) => {
    const dash = (cat.pct / 100) * C;
    const gap = C - dash;
    const offset = cumulativeOffset;
    cumulativeOffset += dash;

    return `
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke="${cat.color}"
        stroke-width="24"
        stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
        stroke-dashoffset="-${offset.toFixed(2)}"
        stroke-linecap="round"
        transform="rotate(-90 100 100)"
        class="donut-slice"
        data-index="${i}"
        style="transition: stroke-width 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease; cursor:pointer;"
      >
        <title>${cat.label}: ₹${cat.value.toLocaleString('en-IN')} (${cat.pct}%)</title>
      </circle>
    `;
  }).join('') : `
    <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" stroke-width="12" stroke-dasharray="6 6" opacity="0.4" />
  `;

  return `
    <div class="donut-chart-svg-wrap">
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Background track ring -->
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" stroke-width="24" opacity="0.25" />
        <!-- Data Slices -->
        ${circles}
      </svg>
      <div class="donut-center-info">
        <div class="center-val">${centerValText}</div>
        <div class="center-lbl">${centerLabelText}</div>
      </div>
    </div>
  `;
}
