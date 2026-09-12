// Deterministic Lead Buying Score & Next Action Engine for Maa Durga Engineering OS

export function calculateBuyingScore(lead) {
  let score = 25; // baseline interest
  const reasons = [];

  // 1. Stage in the buying funnel
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

  // 2. Expected purchase timeline
  const days = Number(lead.expectedPurchaseDays) || 30;
  if (days <= 7) {
    score += 25;
    reasons.push('Immediate purchase intended within 7 days');
  } else if (days <= 15) {
    score += 18;
    reasons.push('Purchase planned within next 2 weeks');
  } else if (days <= 30) {
    score += 10;
    reasons.push('Planning purchase this harvest season (< 30 days)');
  } else {
    score -= 10;
    reasons.push('Long-term horizon (> 30 days)');
  }

  // 3. Finance readiness
  if (lead.financeRequired) {
    score += 8;
    reasons.push('Finance / Kisan Credit Card ready for processing');
  }

  // 4. Exchange tractor availability
  if (lead.exchangeWanted) {
    score += 10;
    reasons.push('Old tractor exchange evaluation in progress (high intent)');
  }

  // 5. Contact recency & follow-up urgency
  const today = new Date();
  const lastContact = lead.lastContactDate ? new Date(lead.lastContactDate) : today;
  const daysSinceContact = Math.floor((today - lastContact) / (1000 * 60 * 60 * 24));

  if (daysSinceContact <= 3) {
    score += 5;
  } else if (daysSinceContact > 10) {
    score -= 15;
    reasons.push('Follow-up delayed (> 10 days since last contact)');
  }

  // Clamp score 0 to 99
  const finalScore = Math.max(10, Math.min(98, Math.round(score)));

  // Category classification
  let category = 'COLD';
  if (finalScore >= 75) {
    category = 'HOT';
  } else if (finalScore >= 50) {
    category = 'WARM';
  }

  // Determine Next Action
  let nextAction = '';
  if (category === 'HOT') {
    if (stage === 'Negotiation') {
      nextAction = 'Call today: Close booking with festive incentive / canopy waiver.';
    } else if (stage === 'Quotation Sent') {
      nextAction = 'Call today: Confirm loan documentation & collect token advance.';
    } else if (stage === 'Demo Scheduled') {
      nextAction = 'Call today: Confirm demo tractor driver and route for village field test.';
    } else {
      nextAction = 'Call today: High purchase intent; schedule showroom visit or demo.';
    }
  } else if (category === 'WARM') {
    if (lead.exchangeWanted) {
      nextAction = 'Dispatch showroom mechanic for used tractor physical valuation.';
    } else {
      nextAction = 'Send WhatsApp implement video & personalized EMI calculation.';
    }
  } else {
    nextAction = 'Add to seasonal WhatsApp broadcast list & follow up next month.';
  }

  return {
    score: finalScore,
    category,
    probability: `${finalScore}%`,
    reasons,
    nextAction
  };
}

export function getTodayCallsQueue(leadsList) {
  // Sort leads by highest score and urgency
  const scored = leadsList.map(lead => ({
    ...lead,
    computedScore: calculateBuyingScore(lead)
  }));

  // Prioritize HOT leads and those whose nextFollowUpDate is today or past
  return scored
    .filter(l => l.computedScore.category === 'HOT' || l.stage === 'Negotiation' || l.stage === 'Quotation Sent')
    .sort((a, b) => b.computedScore.score - a.computedScore.score);
}
