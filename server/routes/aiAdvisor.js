// AI Business Advisor & Dealership Intelligence Router
import express from 'express';
import { db } from '../storage/db.js';

export const aiAdvisorRouter = express.Router();

aiAdvisorRouter.post('/query', (req, res) => {
  const { question } = req.body || {};
  const q = (question || '').toLowerCase();
  
  const leads = db.get('leads');
  const expenses = db.get('expenses');
  const bills = db.get('bills');
  const tractors = db.get('tractors');
  const cashTxns = db.get('cashTransactions');

  if (q.includes('profit') || q.includes('margin') || q.includes('loss') || q.includes('expense')) {
    const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalRev = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
    
    return res.json({
      success: true,
      data: {
        title: "Dealership Margin & Profit Analysis",
        summary: `Total bill book revenue is ₹${totalRev.toLocaleString('en-IN')} against total logged showroom expenses of ₹${totalExp.toLocaleString('en-IN')}.`,
        keyFindings: [
          `Total bills issued: ${bills.length}`,
          `Logged showroom operational expenses: ${expenses.length} entries`,
          `Landed unit economics are tracked per chassis number for accurate dealer net margin.`
        ],
        recommendation: "Keep tagging freight and PDI directly to tractor chassis to identify individual unit margins."
      }
    });
  }

  if (q.includes('call') || q.includes('lead') || q.includes('today') || q.includes('hot')) {
    const hotLeads = leads.filter(l => Number(l.buyingScore) >= 75 || l.stage === 'Negotiation');
    return res.json({
      success: true,
      data: {
        title: "Daily Calling & Sales Priority Queue",
        summary: hotLeads.length > 0
          ? `You have ${hotLeads.length} High-Intent (Hot) farmer leads in your immediate pipeline.`
          : `You have ${leads.length} active enquiries in your sales pipeline.`,
        keyFindings: (hotLeads.length > 0 ? hotLeads : leads).slice(0, 3).map(l => 
          `🔥 ${l.name} (${l.village || 'Gorakhpur'}) - Score ${l.buyingScore}/100. Next: ${l.nextAction || 'Follow up'}`
        ),
        recommendation: hotLeads[0] ? `Call ${hotLeads[0].name} (${hotLeads[0].phone}) first to schedule demo or finalize booking.` : "Review pipeline."
      }
    });
  }

  return res.json({
    success: true,
    data: {
      title: "Maa Durga Dealership Sales Intelligence",
      summary: `Analyzed showroom data: ${tractors.length} VST Zetor models, ${leads.length} active leads, and ${bills.length} bills.`,
      keyFindings: [
        `Tractor Stock: ${tractors.filter(t => t.stockCount > 0).length} models in stock ready for same-day delivery.`,
        `High-intent leads: ${leads.filter(l => Number(l.buyingScore) >= 75).length} farmers with buying score >= 75%`,
        `Active Field Demos: ${db.get('demos').length} scheduled village demonstrations.`
      ],
      recommendation: "Focus on closing hot quotation negotiations and scheduling village field demonstrations."
    }
  });
});
