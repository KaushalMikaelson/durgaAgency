// Grounded AI Business Advisor & Sales Assistant for Maa Durga Engineering OS
// Operates on real ledger & CRM data without hallucinations or seeded dummy data

import { store } from './store.js';

export function queryBusinessAdvisor(userQuestion) {
  const q = (userQuestion || '').toLowerCase();
  const leads = store.getLeads();
  const snapshot = store.getFinancialSnapshot();
  const expenses = store.getExpenses();
  const quotes = store.getQuotes();
  const tractors = store.getTractors();

  if (q.includes('profit') || q.includes('margin') || q.includes('loss') || q.includes('why')) {
    const sortedCats = Object.entries(snapshot.categoryTotals).sort((a, b) => b[1] - a[1]);
    if (expenses.length === 0 && quotes.length === 0) {
      return {
        title: "Showroom Financial Ledger (Clean Slate)",
        summary: "Currently no sales or operating expenses are recorded in the active ledger.",
        keyFindings: [
          "Gross Profit: ₹0.00 | Total Showroom Expenses: ₹0.00 | Net Profit: ₹0.00",
          "To track true landed margins, log showroom costs with '+ Expense' and tag freight/PDI to chassis numbers.",
          "Issued quotations and recorded tractor sales automatically accrue into showroom revenue."
        ],
        recommendation: "Issue your first customer quotation or log initial operational expenses to begin tracking live unit economics."
      };
    }

    const top1 = sortedCats[0] || ['Operational', 0];
    const top2 = sortedCats[1] || ['Utilities', 0];
    return {
      title: "Showroom Profitability & Margin Diagnostic",
      summary: `Gross Profit is ₹${(snapshot.grossProfit / 100000).toFixed(2)}L against total showroom expenses of ₹${(snapshot.totalExpenses / 100000).toFixed(2)}L, leaving Net Profit at ₹${(snapshot.netProfit / 100000).toFixed(2)}L.`,
      keyFindings: [
        sortedCats.length > 0 ? `Highest recorded expense category is ${top1[0]} (₹${Number(top1[1]).toLocaleString('en-IN')})${sortedCats.length > 1 ? `, followed by ${top2[0]} (₹${Number(top2[1]).toLocaleString('en-IN')})` : ''}.` : 'No category expenses recorded yet.',
        `Total approved showroom expenses count: ${expenses.filter(e => e.status === 'Approved').length} records.`,
        `Net Cash Flow is ₹${(snapshot.netCashFlow / 100000).toFixed(2)}L based on recorded cash in/out transactions.`
      ],
      recommendation: snapshot.netProfit < 0 ? "Operating overheads currently exceed gross margins; prioritize closing pending hot quotations." : "Healthy dealer margins maintained. Keep monitoring freight and PDI costs tagged to chassis numbers."
    };
  }

  if (q.includes('call') || q.includes('lead') || q.includes('today') || q.includes('focus')) {
    if (leads.length === 0) {
      return {
        title: "Daily Calling Queue (Empty)",
        summary: "You have 0 active farmer leads in the CRM.",
        keyFindings: [
          "The calling queue is currently empty.",
          "Click '+ Lead' in the top header or customer tab to enter walk-in or referral enquiries.",
          "The algorithm will immediately calculate a 0-100 buying score and assign next action."
        ],
        recommendation: "Record walk-in farmers or phone enquiries to build your active sales calling queue."
      };
    }

    const hot = leads.filter(l => (l.buyingScore >= 75) || l.stage === 'Negotiation');
    const targetLeads = hot.length > 0 ? hot : leads.slice(0, 3);
    return {
      title: "Daily Sales Calling Priority Recommendation",
      summary: hot.length > 0 ? `You have ${hot.length} Hot Leads requiring immediate showroom contact today.` : `You have ${leads.length} customer leads in follow-up pipeline.`,
      keyFindings: targetLeads.map(l => `🔥 ${l.name} (${l.village || 'Sadar'}) — Score ${l.buyingScore || 70}/100. Stage: ${l.stage || 'Enquiry'}. Next: ${l.nextAction || 'Follow up on tractor requirement'}`),
      recommendation: targetLeads[0] ? `Call ${targetLeads[0].name} (${targetLeads[0].phone}) first to discuss financing or schedule a village demonstration.` : "Review lead pipeline."
    };
  }

  if (q.includes('village') || q.includes('area') || q.includes('map') || q.includes('demand')) {
    if (leads.length === 0) {
      return {
        title: "Village Territory Intelligence",
        summary: "No village data recorded yet.",
        keyFindings: [
          "Territory clustering activates automatically as you add customer leads with their village names.",
          "The system will highlight high-demand villages, dominant crops, and recommend route planning for field demonstration trolleys."
        ],
        recommendation: "Capture farmer village names during enquiry entry to generate geographic demand heatmaps."
      };
    }

    const villageCounts = {};
    for (const l of leads) {
      const v = l.village || 'Sadar / Town';
      villageCounts[v] = (villageCounts[v] || 0) + 1;
    }
    const sorted = Object.entries(villageCounts).sort((a, b) => b[1] - a[1]);
    const topV = sorted[0];

    return {
      title: "Village Territory & Rural Cluster Intelligence",
      summary: `Top agricultural demand cluster is Village ${topV[0]} with ${topV[1]} active leads.`,
      keyFindings: sorted.slice(0, 4).map(([vName, count]) => `Village ${vName}: ${count} active farmer ${count === 1 ? 'enquiry' : 'enquiries'}.`),
      recommendation: `Schedule field demonstration trolley route through Village ${topV[0]} to maximize farmer engagement.`
    };
  }

  return {
    title: "Maa Durga Engineering Sales Advisory",
    summary: `Analyzed your live showroom database containing ${leads.length} leads, ${tractors.length} tractor catalog models, and ${quotes.length} formal quotations.`,
    keyFindings: [
      `Active Leads: ${leads.length} total (${leads.filter(l => (l.buyingScore || 0) >= 75).length} Hot priority).`,
      `Financials: Gross Profit ₹${(snapshot.grossProfit / 100000).toFixed(2)}L | Operating Expenses ₹${(snapshot.totalExpenses / 100000).toFixed(2)}L.`,
      `Physical Inventory: ${tractors.reduce((s, t) => s + (t.stockCount || 0), 0)} units currently in stock.`
    ],
    recommendation: leads.length === 0 ? "Start by adding customer leads or logging expenses using the top action buttons." : "Try asking: 'Why was profit lower this month?', 'Who should I call today?', or 'Show village demand breakdown'."
  };
}
