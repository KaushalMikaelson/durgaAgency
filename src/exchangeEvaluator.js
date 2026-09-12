// Used Tractor Exchange Valuation & Inspection Module for Maa Durga Engineering OS

export function evaluateUsedTractor({
  brand,
  model,
  manufactureYear = 2018,
  meterHours = 3500,
  tyreConditionPercent = 65,
  engineCondition = 'Good', // 'Excellent', 'Good', 'Average', 'Poor'
  hydraulicsCondition = 'Good',
  ptoCondition = 'Good',
  transmissionCondition = 'Good',
  newTractorPrice = 840000
}) {
  const currentYear = new Date().getFullYear();
  const age = Math.max(1, currentYear - Number(manufactureYear));
  const hours = Number(meterHours) || 3000;
  const tyres = Number(tyreConditionPercent) || 50;

  // Base market valuation by age (Indian commercial tractor depreciation baseline)
  // Standard ~50 HP used tractor baseline: ~₹5,00,000 for 5-6 year old tractor
  let baseValue = 520000;

  // Depreciation: ~5-7% per year of age
  baseValue -= (age * 22000);

  // Meter hours impact
  if (hours > 5000) {
    baseValue -= 35000;
  } else if (hours > 3000) {
    baseValue -= 18000;
  } else if (hours < 1500) {
    baseValue += 25000;
  }

  // Tyre condition (New set of rear tractor tyres costs ~₹38,000 - ₹45,000)
  if (tyres < 35) {
    baseValue -= 28000; // farmer needs new tyres
  } else if (tyres > 80) {
    baseValue += 18000; // fresh tyres
  }

  // Engine mechanical state
  if (engineCondition === 'Excellent') baseValue += 20000;
  else if (engineCondition === 'Average') baseValue -= 25000;
  else if (engineCondition === 'Poor') baseValue -= 50000;

  // Hydraulics & PTO
  if (hydraulicsCondition === 'Poor') baseValue -= 20000;
  if (ptoCondition === 'Poor') baseValue -= 15000;
  if (transmissionCondition === 'Poor') baseValue -= 25000;

  // Floor safeguard
  baseValue = Math.max(120000, Math.round(baseValue / 5000) * 5000);

  // Valuation range (+- 7%)
  const minValuation = Math.round(baseValue * 0.94);
  const maxValuation = Math.round(baseValue * 1.06);
  const recommendedExchangeOffer = Math.round(baseValue);

  const effectiveNewPrice = Math.max(0, newTractorPrice - recommendedExchangeOffer);

  const inspectionChecklist = [
    { item: "Engine Compression & Blow-by Smoke", status: engineCondition, critical: true },
    { item: "Hydraulic Lift Reaction & Oil Leakage", status: hydraulicsCondition, critical: true },
    { item: "Dual-Clutch & PTO Spline Play", status: ptoCondition, critical: true },
    { item: "Transmission Gearbox Grinding & Reverse Lock", status: transmissionCondition, critical: true },
    { item: "Tyre Lug Remaining Depth & Side Cracks", status: `${tyres}% Life`, critical: false },
    { item: "RC Book & Bank NOC Hypothecation Check", status: "Document Verification", critical: true }
  ];

  return {
    brand,
    model,
    manufactureYear,
    meterHours: hours,
    minValuation,
    maxValuation,
    recommendedOffer: recommendedExchangeOffer,
    newTractorPrice,
    effectivePurchaseAmount: effectiveNewPrice,
    inspectionChecklist
  };
}
