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

// Helper: Check if an item's date falls within the PREVIOUS period (for comparison)
function isDateInPreviousTimeframe(itemDate, tf) {
  if (!itemDate) return false;
  const now = new Date();

  if (tf === 'daily') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      itemDate.getDate() === yesterday.getDate() &&
      itemDate.getMonth() === yesterday.getMonth() &&
      itemDate.getFullYear() === yesterday.getFullYear()
    );
  }

  if (tf === 'weekly') {
    const diffMs = now.getTime() - itemDate.getTime();
    return diffMs > 7 * 24 * 60 * 60 * 1000 && diffMs <= 14 * 24 * 60 * 60 * 1000;
  }

  if (tf === 'monthly') {
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return (
      itemDate.getMonth() === prevMonth &&
      itemDate.getFullYear() === prevYear
    );
  }

  if (tf === 'yearly') {
    return itemDate.getFullYear() === now.getFullYear() - 1;
  }

  return false;
}

// Helper: Get label for the previous period
function getPreviousPeriodLabel(tf) {
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (tf === 'daily') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return `Yesterday (${y.getDate()} ${monthNames[y.getMonth()]})`;
  }
  if (tf === 'weekly') return 'Previous 7 Days';
  if (tf === 'monthly') {
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return `${monthNames[prevMonth]} ${prevYear}`;
  }
  if (tf === 'yearly') return `Year ${now.getFullYear() - 1}`;
  return 'Previous Period';
}

// Helper: Check if two dates represent the exact same calendar day
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

// Helper: Calculate the 7 days for a given week selection (current, prev, week1, week2, week3, week4)
function getDaysForWeekSelection(selectedWeek, monthIdx, year) {
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = monthIdx !== null && monthIdx !== undefined ? monthIdx : now.getMonth();

  if (selectedWeek === 'current') {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    }
    return days;
  }

  if (selectedWeek === 'prev') {
    const days = [];
    for (let i = 13; i >= 7; i--) {
      days.push(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    }
    return days;
  }

  let startDay = 1;
  let endDay = 7;
  if (selectedWeek === 'week2') { startDay = 8; endDay = 14; }
  else if (selectedWeek === 'week3') { startDay = 15; endDay = 21; }
  else if (selectedWeek === 'week4') { startDay = 22; endDay = 28; }

  const days = [];
  for (let d = startDay; d <= endDay; d++) {
    days.push(new Date(targetYear, targetMonth, d));
  }
  return days;
}

export function getAnalyticsViewModel(timeframe = 'monthly', store, customOptions = {}) {
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

  // Helper: Cumulative Net Balance of the dealership up to a specific date
  function getCumulativeBalanceTill(targetDate) {
    if (!targetDate) return 0;
    const cutoff = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const histBills = bills.filter(b => {
      const bd = parseItemDate(b.date);
      return bd && bd.getTime() <= cutoff.getTime();
    });
    const histPaid = histBills.reduce((sum, b) => {
      const tot = Number(b.totalRupees || 0);
      if (b.paymentStatus === 'Due') return sum;
      if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
        return sum + Math.min(tot, Math.max(0, Number(b.paidAmount) || 0));
      }
      return sum + (b.paidAmount ? Number(b.paidAmount) : tot);
    }, 0);
    const histCashIn = cashTxns.filter(t => {
      const td = parseItemDate(t.date);
      return td && td.getTime() <= cutoff.getTime() && t.type === 'IN';
    }).reduce((s, t) => s + Number(t.amount || 0), 0);
    const histInflows = Math.max(histPaid, histCashIn);

    const histExp = expenses.filter(e => {
      const ed = parseItemDate(e.date);
      return ed && ed.getTime() <= cutoff.getTime() && e.status === 'Approved';
    }).reduce((s, e) => s + Number(e.amount || 0), 0);
    const histCashOut = cashTxns.filter(t => {
      const td = parseItemDate(t.date);
      return td && td.getTime() <= cutoff.getTime() && t.type === 'OUT';
    }).reduce((s, t) => s + Number(t.amount || 0), 0);
    const histOutflows = Math.max(histExp, histCashOut);

    return Math.max(0, histInflows - histOutflows);
  }

  const now = new Date();
  const currentNetBalanceTillDate = getCumulativeBalanceTill(now);

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
      const bCash = periodCashTxns.filter(t => {
        const h = getItemHour(t);
        return h !== null ? (h >= b.start && h < b.end) : false;
      });

      const intvRev = bBills.reduce((s, bill) => s + Number(bill.totalRupees || 0), 0) +
                      bQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const intvExp = bExpenses.reduce((s, exp) => s + Number(exp.amount || 0), 0);
      const intvCash = bCash.filter(t => t.type === 'IN').reduce((s, t) => s + Number(t.amount || 0), 0);
      const intvPaid = bBills.reduce((s, b) => s + (Number(b.paidAmount) || (b.paymentStatus !== 'Due' ? Number(b.totalRupees || 0) : 0)), 0);
      const finalCashIn = Math.max(intvCash, intvPaid);

      return {
        label: b.label,
        income: intvRev,
        expense: intvExp,
        profit: intvRev,
        netprofit: Math.max(0, intvRev - intvExp),
        balance: Math.max(0, finalCashIn - intvExp),
        revenue: intvRev,
        net: Math.max(0, intvRev - intvExp),
        cashIn: finalCashIn
      };
    });

    // If items had no hourly timestamps, attribute to first business bucket rather than losing data
    const totalBucketedRev = chartIntervals.reduce((s, i) => s + i.revenue, 0);
    const totalBucketedExp = chartIntervals.reduce((s, i) => s + i.expense, 0);
    const totalBucketedCash = chartIntervals.reduce((s, i) => s + (i.cashIn || 0), 0);
    if (totalBucketedRev === 0 && revenue > 0) {
      chartIntervals[1].income = revenue;
      chartIntervals[1].revenue = revenue;
      chartIntervals[1].profit += revenue;
      chartIntervals[1].netprofit += revenue;
      chartIntervals[1].net += revenue;
    }
    if (totalBucketedExp === 0 && totalExpenses > 0) {
      chartIntervals[1].expense = totalExpenses;
      chartIntervals[1].netprofit -= totalExpenses;
      chartIntervals[1].net -= totalExpenses;
    }
    if (totalBucketedCash === 0 && cashIn > 0) {
      chartIntervals[1].cashIn = cashIn;
      chartIntervals[1].balance = Math.max(0, cashIn - totalExpenses);
    }
  } else if (tf === 'weekly') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const primDays = getDaysForWeekSelection(
      customOptions.selectedWeek || 'current',
      customOptions.selectedMonth,
      customOptions.selectedYear
    );

    // Determine comparison week days if requested
    let compDays = null;
    if (customOptions.comparisonWeek && customOptions.comparisonWeek !== 'none') {
      let compWkKey = customOptions.comparisonWeek;
      if (compWkKey === 'prev') {
        const primKey = customOptions.selectedWeek || 'current';
        if (primKey === 'current') compWkKey = 'prev';
        else if (primKey === 'week4') compWkKey = 'week3';
        else if (primKey === 'week3') compWkKey = 'week2';
        else if (primKey === 'week2') compWkKey = 'week1';
        else compWkKey = 'prev';
      }
      compDays = getDaysForWeekSelection(compWkKey, customOptions.selectedMonth, customOptions.selectedYear);
    }

    chartIntervals = primDays.map((primDate, idx) => {
      const dayLabel = `${dayNames[primDate.getDay()]} (${primDate.getDate()})`;
      const dayBills = bills.filter(b => {
        const bd = parseItemDate(b.date);
        return bd && isSameDay(bd, primDate);
      });
      const dayExp = approvedExpenses.filter(e => {
        const ed = parseItemDate(e.date);
        return ed && isSameDay(ed, primDate);
      });
      const dayQuotes = quotes.filter(q => {
        const qd = parseItemDate(q.date);
        return qd && isSameDay(qd, primDate);
      });
      const dayCash = cashTxns.filter(t => {
        const td = parseItemDate(t.date);
        return td && isSameDay(td, primDate);
      });

      const dayRev = dayBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
        dayQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const dayExpenses = dayExp.reduce((s, e) => s + Number(e.amount || 0), 0);
      const dayCashIn = dayCash.filter(t => t.type === 'IN').reduce((s, t) => s + Number(t.amount || 0), 0);
      const dayPaid = dayBills.reduce((s, b) => s + (Number(b.paidAmount) || (b.paymentStatus !== 'Due' ? Number(b.totalRupees || 0) : 0)), 0);
      const finalCash = Math.max(dayCashIn, dayPaid);
      const dayProfit = dayRev;
      const dayNetProfit = Math.max(0, dayProfit - dayExpenses);

      // Comparison metrics
      let compRev = 0;
      let compExpenses = 0;
      let compProfit = 0;
      let compNetProfit = 0;
      let compLabel = null;

      if (compDays && compDays[idx]) {
        const compDate = compDays[idx];
        compLabel = `${dayNames[compDate.getDay()]} (${compDate.getDate()})`;
        const cBills = bills.filter(b => {
          const bd = parseItemDate(b.date);
          return bd && isSameDay(bd, compDate);
        });
        const cExp = approvedExpenses.filter(e => {
          const ed = parseItemDate(e.date);
          return ed && isSameDay(ed, compDate);
        });
        const cQuotes = quotes.filter(q => {
          const qd = parseItemDate(q.date);
          return qd && isSameDay(qd, compDate);
        });
        compRev = cBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
          cQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
        compExpenses = cExp.reduce((s, e) => s + Number(e.amount || 0), 0);
        compProfit = compRev;
        compNetProfit = Math.max(0, compProfit - compExpenses);
      }

      const dayNetBalanceTillDate = getCumulativeBalanceTill(primDate);

      return {
        label: dayLabel,
        dayName: dayNames[primDate.getDay()],
        income: dayRev,
        expense: dayExpenses,
        profit: dayRev,
        netprofit: dayNetProfit,
        netBalanceTillDate: dayNetBalanceTillDate,
        balance: dayNetBalanceTillDate,
        revenue: dayRev,
        net: dayNetProfit,
        cashIn: finalCash,
        compIncome: compRev,
        compExpense: compExpenses,
        compProfit: compProfit,
        compNetProfit: compNetProfit,
        compLabel: compLabel
      };
    });
  } else if (tf === 'monthly') {
    const targetMonth = customOptions.selectedMonth !== null && customOptions.selectedMonth !== undefined ? customOptions.selectedMonth : now.getMonth();
    const targetYear = customOptions.selectedYear || now.getFullYear();
    const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
    const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;

    const weeks = [
      { label: 'Week 1 (1-7)', startDay: 1, endDay: 7 },
      { label: 'Week 2 (8-14)', startDay: 8, endDay: 14 },
      { label: 'Week 3 (15-21)', startDay: 15, endDay: 21 },
      { label: 'Week 4 (22-31)', startDay: 22, endDay: 31 }
    ];

    chartIntervals = weeks.map(w => {
      const wBills = bills.filter(b => {
        const d = parseItemDate(b.date);
        return d && d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
      });
      const wExp = approvedExpenses.filter(e => {
        const d = parseItemDate(e.date);
        return d && d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
      });
      const wQuotes = quotes.filter(q => {
        const d = parseItemDate(q.date);
        return d && d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
      });
      const wRev = wBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
        wQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const wExpenses = wExp.reduce((s, e) => s + Number(e.amount || 0), 0);
      const wProfit = wRev;
      const wNetProfit = Math.max(0, wProfit - wExpenses);

      // Previous month comparison for this week
      let cRev = 0;
      let cExpenses = 0;
      let cNetProfit = 0;
      if (customOptions.comparisonMonth !== 'none') {
        const cBills = bills.filter(b => {
          const d = parseItemDate(b.date);
          return d && d.getFullYear() === prevYear && d.getMonth() === prevMonth && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
        });
        const cExp = approvedExpenses.filter(e => {
          const d = parseItemDate(e.date);
          return d && d.getFullYear() === prevYear && d.getMonth() === prevMonth && d.getDate() >= w.startDay && d.getDate() <= w.endDay;
        });
        cRev = cBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0);
        cExpenses = cExp.reduce((s, e) => s + Number(e.amount || 0), 0);
        cNetProfit = Math.max(0, cRev - cExpenses);
      }

      const weekEndDate = new Date(targetYear, targetMonth, Math.min(w.endDay, 28));
      const wNetBalanceTillDate = getCumulativeBalanceTill(weekEndDate);

      return {
        label: w.label,
        income: wRev,
        expense: wExpenses,
        profit: wRev,
        netprofit: wNetProfit,
        netBalanceTillDate: wNetBalanceTillDate,
        balance: wNetBalanceTillDate,
        revenue: wRev,
        net: wNetProfit,
        cashIn: wRev,
        compIncome: cRev,
        compExpense: cExpenses,
        compProfit: cRev,
        compNetProfit: cNetProfit,
        compLabel: `${w.label} (Prev Mo)`
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
      const mCash = periodCashTxns.filter(t => {
        const td = parseItemDate(t.date);
        return td && td.getMonth() === mIdx;
      });

      const mRev = mBills.reduce((s, b) => s + Number(b.totalRupees || 0), 0) +
        mQuotes.reduce((s, q) => s + Number(q.grandTotal || 0), 0);
      const mExpenses = mExp.reduce((s, e) => s + Number(e.amount || 0), 0);
      const mCashIn = mCash.filter(t => t.type === 'IN').reduce((s, t) => s + Number(t.amount || 0), 0);
      const mPaid = mBills.reduce((s, b) => s + (Number(b.paidAmount) || (b.paymentStatus !== 'Due' ? Number(b.totalRupees || 0) : 0)), 0);
      const finalMCash = Math.max(mCashIn, mPaid);

      return {
        label: mName,
        income: mRev,
        expense: mExpenses,
        profit: mRev - mExpenses,
        balance: Math.max(0, finalMCash - mExpenses),
        revenue: mRev,
        net: mRev - mExpenses,
        cashIn: finalMCash
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

  // 18. Period-over-Period Comparison Data
  // Compute the same KPIs for the PREVIOUS period to enable comparison charts
  const prevBills = bills.filter(b => isDateInPreviousTimeframe(parseItemDate(b.date), tf));
  const prevExpensesAll = expenses.filter(e => isDateInPreviousTimeframe(parseItemDate(e.date), tf));
  const prevApprovedExpenses = prevExpensesAll.filter(e => e.status === 'Approved');
  const prevCashTxns = cashTxns.filter(t => isDateInPreviousTimeframe(parseItemDate(t.date), tf));
  const prevLeadsAll = leads.filter(l => isDateInPreviousTimeframe(parseItemDate(l.lastContactDate || l.createdAt), tf));
  const prevQuotesAll = quotes.filter(q => isDateInPreviousTimeframe(parseItemDate(q.date), tf));
  const prevDemosAll = demos.filter(d => isDateInPreviousTimeframe(parseItemDate(d.date), tf));

  const prevBilledRupees = prevBills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
  const prevPaidRupees = prevBills.reduce((sum, b) => {
    const tot = Number(b.totalRupees || 0);
    if (b.paymentStatus === 'Due') return sum;
    if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
      return sum + Math.min(tot, Math.max(0, Number(b.paidAmount) || 0));
    }
    return sum + (b.paidAmount ? Number(b.paidAmount) : tot);
  }, 0);
  const prevQuoteRevenue = prevQuotesAll.reduce((sum, q) => sum + Number(q.grandTotal || 0), 0);
  const prevRevenue = Math.max(prevQuoteRevenue + prevBilledRupees,
    prevCashTxns.filter(t => t.type === 'IN').reduce((sum, t) => sum + Number(t.amount || 0), 0));
  const prevTotalExpenses = prevApprovedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  let prevCOGS = 0;
  for (const q of prevQuotesAll) {
    const tr = tractors.find(t => t.id === q.tractorId || t.model === q.tractorModel || (q.tractorName && q.tractorName.includes(t.model)));
    if (tr && tr.dealerPurchaseCost) prevCOGS += Number(tr.dealerPurchaseCost);
  }
  const prevGrossProfit = Math.max(0, prevRevenue - prevCOGS);
  const prevNetProfit = prevGrossProfit - prevTotalExpenses;

  const prevCashIn = prevCashTxns.filter(t => t.type === 'IN').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const prevCashOut = prevCashTxns.filter(t => t.type === 'OUT').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const prevNetCashFlow = prevCashIn - prevCashOut;

  const prevCollectionRate = prevBilledRupees > 0 ? Math.round((prevPaidRupees / prevBilledRupees) * 100) : (prevBills.length > 0 ? 100 : 0);
  const prevTractorsDelivered = prevQuotesAll.filter(q => q.status === 'Delivered' || q.status === 'Closed' || q.delivered === true).length +
    prevBills.filter(b => b.vehicle || (b.items && b.items.some(i => (i.description || '').toLowerCase().includes('tractor')))).length;

  const previousPeriodLabel = getPreviousPeriodLabel(tf);

  // Comparison bars data: each metric has current vs previous
  const comparisonBars = [
    { label: 'Revenue', labelHi: 'राजस्व', current: revenue, previous: prevRevenue, color: '#10b981', icon: 'revenue' },
    { label: 'Expenses', labelHi: 'खर्चे', current: totalExpenses, previous: prevTotalExpenses, color: '#ef4444', icon: 'expenses' },
    { label: 'Net Profit', labelHi: 'शुद्ध लाभ', current: netProfit, previous: prevNetProfit, color: '#3b82f6', icon: 'profit' },
    { label: 'Cash Inflow', labelHi: 'नकद आमद', current: cashIn, previous: prevCashIn, color: '#06b6d4', icon: 'cashIn' },
    { label: 'Cash Outflow', labelHi: 'नकद निकासी', current: cashOut, previous: prevCashOut, color: '#f97316', icon: 'cashOut' },
    { label: 'Billed Amount', labelHi: 'बिल राशि', current: billedRupees, previous: prevBilledRupees, color: '#8b5cf6', icon: 'billed' },
    { label: 'Collected', labelHi: 'वसूली', current: paidRupees, previous: prevPaidRupees, color: '#14b8a6', icon: 'collected' },
    { label: 'Gross Profit', labelHi: 'सकल लाभ', current: grossProfit, previous: prevGrossProfit, color: '#22c55e', icon: 'gross' },
  ];

  // Comparison stats summary
  const comparisonStats = [
    { label: 'Bills', current: billsCount, previous: prevBills.length },
    { label: 'Leads', current: totalLeads, previous: prevLeadsAll.length },
    { label: 'Demos', current: totalDemos, previous: prevDemosAll.length },
    { label: 'Quotes', current: totalQuotes, previous: prevQuotesAll.length },
    { label: 'Deliveries', current: tractorsDelivered, previous: prevTractorsDelivered },
    { label: 'Collection %', current: collectionRate, previous: prevCollectionRate, isPercent: true },
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
    cogs: costOfGoodsSold,
    // Comparison data
    previousPeriodLabel,
    comparisonBars,
    comparisonStats,
    prevRevenue,
    prevTotalExpenses,
    prevNetProfit,
    prevCashIn,
    prevCashOut,
    prevNetCashFlow,
    netBalanceTillDate: currentNetBalanceTillDate,
  };
}

// Generate Mathematical SVG Bar Chart with Capsule Track Design (Matching UI Reference)
export function renderBarChartSVG(intervals) {
  const width = 760;
  const height = 270;
  const padLeft = 55;
  const padRight = 25;
  const padTop = 25;
  const padBottom = 42;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const baselineY = padTop + chartH;

  const maxVal = Math.max(1000, ...intervals.map(i => Math.max(i.revenue || 0, 1000))) * 1.15;

  const numBuckets = Math.max(1, intervals.length);
  const slotW = chartW / numBuckets;
  const barW = Math.max(28, Math.min(54, slotW * 0.54));
  const cornerRadius = Math.min(12, Math.round(barW / 2));

  // Grid Lines
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];
  const gridLines = gridSteps.map(step => {
    const y = baselineY - (step * chartH);
    const val = Math.round(step * maxVal);
    let label = val >= 10000000 ? `₹${(val / 10000000).toFixed(1)}Cr` :
                val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` :
                val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`;
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="4 4" stroke-width="1" opacity="0.6" />
      <text x="${padLeft - 12}" y="${y + 4}" text-anchor="end" fill="var(--text-muted)" font-size="11" font-weight="600">${label}</text>
    `;
  }).join('');

  // Capsule Bars
  const bars = intervals.map((intv, idx) => {
    const centerX = padLeft + idx * slotW + slotW / 2;
    const barX = centerX - barW / 2;
    const revVal = intv.revenue || 0;
    const rawH = (revVal / maxVal) * chartH;
    const barH = revVal > 0 ? Math.max(cornerRadius * 1.5, rawH) : 0;
    const barY = baselineY - barH;

    const revTooltip = `Turnover: ₹${(revVal).toLocaleString('en-IN')}`;

    return `
      <g class="chart-column-group" data-interval="${idx}" style="cursor: pointer;">
        <!-- Full-height background track capsule -->
        <rect x="${barX}" y="${padTop}" width="${barW}" height="${chartH}" rx="${cornerRadius}" ry="${cornerRadius}" fill="var(--chart-track, rgba(0,0,0,0.045))" />
        
        <!-- Active solid deep teal foreground bar -->
        ${barH > 0 ? `
          <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#tealBarGrad)" class="chart-bar-rect">
            <title>${intv.label} - ${revTooltip}</title>
          </rect>
        ` : ''}

        <text x="${centerX}" y="${height - 12}" text-anchor="middle" fill="var(--text-secondary)" font-size="11.5" font-weight="600">${intv.label}</text>
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="tealBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#087f8c" />
          <stop offset="100%" stop-color="#006672" />
        </linearGradient>
      </defs>

      ${gridLines}
      <line x1="${padLeft}" y1="${baselineY}" x2="${width - padRight}" y2="${baselineY}" stroke="var(--border-color)" stroke-width="1" opacity="0.8" />
      ${bars}
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
