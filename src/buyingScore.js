// Self-Managed Lead Buying Score & Next Action Engine for Maa Durga Engineering OS

export function calculateBuyingScore(lead) {
  if (!lead) return { score: null, category: null, probability: null, reasons: [], nextAction: '' };

  // 1. Direct Self-Managed Score (if set by user)
  if (lead.buyingScore !== undefined && lead.buyingScore !== null && lead.buyingScore !== '') {
    const finalScore = Math.max(0, Math.min(100, Math.round(Number(lead.buyingScore))));
    let category = 'COLD';
    if (finalScore >= 75) {
      category = 'HOT';
    } else if (finalScore >= 50) {
      category = 'WARM';
    }

    return {
      score: finalScore,
      category,
      probability: `${finalScore}%`,
      reasons: ['Self-managed score by sales team'],
      nextAction: lead.nextAction || (category === 'HOT' ? 'Call customer today: High purchase intent' : '')
    };
  }

  // 2. If score was not provided, return null / empty state
  return {
    score: null,
    category: null,
    probability: null,
    reasons: [],
    nextAction: lead.nextAction || ''
  };
}

// Algorithmic Suggestion Helper (when user clicks "Suggest Score")
export function suggestLeadBuyingScore(lead) {
  let score = 25;
  const reasons = [];

  const stage = lead.stage || 'New Enquiry';
  if (stage === 'Negotiation') {
    score += 35;
    reasons.push('Customer in active price negotiation');
  } else if (stage === 'Quotation Sent') {
    score += 25;
    reasons.push('Customer formally requested & received quotation');
  } else if (stage === 'Demo Scheduled' || stage === 'Demo Completed') {
    score += 22;
    reasons.push('Field demonstration interest / completed');
  } else if (stage === 'Needs Analyzed') {
    score += 15;
    reasons.push('Requirements & implement needs matched');
  }

  const days = Number(lead.expectedPurchaseDays);
  if (days && days <= 7) {
    score += 25;
    reasons.push('Immediate purchase intended within 7 days');
  } else if (days && days <= 15) {
    score += 18;
    reasons.push('Purchase planned within next 2 weeks');
  } else if (days && days <= 30) {
    score += 10;
    reasons.push('Planning purchase this harvest season (< 30 days)');
  } else if (days && days > 30) {
    score -= 10;
    reasons.push('Long-term horizon (> 30 days)');
  }

  if (lead.financeRequired === true) {
    score += 8;
    reasons.push('Finance / Kisan Credit Card ready for processing');
  }

  if (lead.exchangeWanted === true) {
    score += 10;
    reasons.push('Old tractor exchange evaluation in progress (high intent)');
  }

  const finalScore = Math.max(10, Math.min(98, Math.round(score)));
  let category = 'COLD';
  if (finalScore >= 75) {
    category = 'HOT';
  } else if (finalScore >= 50) {
    category = 'WARM';
  }

  return {
    score: finalScore,
    category,
    probability: `${finalScore}%`,
    reasons
  };
}

export function getTodayCallsQueue(leadsList) {
  const scored = leadsList.map(lead => ({
    ...lead,
    computedScore: calculateBuyingScore(lead)
  }));

  return scored
    .filter(l => (l.computedScore && l.computedScore.category === 'HOT') || l.stage === 'Negotiation' || l.stage === 'Quotation Sent')
    .sort((a, b) => (b.computedScore.score || 0) - (a.computedScore.score || 0));
}
