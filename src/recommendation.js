// Deterministic Tractor Recommendation Engine for Maa Durga Engineering
// Verifies actual tractor specs without LLM hallucinations

export function matchTractor({
  landAcres,
  crops = [],
  soilType = 'Medium',
  implementsNeeded = [],
  budgetMax,
  requiresHeavyTrolley = false,
  drivePreference = 'Any', // '2WD', '4WD', 'Any'
  tractorsList = []
}) {
  const acres = Number(landAcres) || 10;
  const budget = Number(budgetMax) || 1000000;

  // Determine needed HP range based on acreage, soil resistance, and implements
  let recommendedMinHp = 35;
  let recommendedMaxHp = 65;

  if (acres <= 7) {
    recommendedMinHp = 35;
    recommendedMaxHp = 45;
  } else if (acres <= 15) {
    recommendedMinHp = 42;
    recommendedMaxHp = 52;
  } else if (acres <= 30) {
    recommendedMinHp = 48;
    recommendedMaxHp = 58;
  } else {
    recommendedMinHp = 50;
    recommendedMaxHp = 70;
  }

  // Adjust for heavy soil (Black soil requires +3 to +5 HP or 4WD)
  const isHeavySoil = soilType.toLowerCase().includes('black') || soilType.toLowerCase().includes('clay') || soilType.toLowerCase().includes('hard');
  if (isHeavySoil) {
    recommendedMinHp += 3;
  }

  // Adjust for heavy implements (Rotavator 6-7ft, Laser leveller, Sugarcane loader, 2-MB Plough)
  const hasRotavator = implementsNeeded.some(i => i.toLowerCase().includes('rotavator'));
  const hasHeavyImplement = implementsNeeded.some(i => 
    i.toLowerCase().includes('plough') || 
    i.toLowerCase().includes('leveller') || 
    i.toLowerCase().includes('baler')
  );

  if (hasRotavator) recommendedMinHp = Math.max(recommendedMinHp, 45);
  if (hasHeavyImplement) recommendedMinHp = Math.max(recommendedMinHp, 48);
  if (requiresHeavyTrolley) recommendedMinHp = Math.max(recommendedMinHp, 45);

  // Score each tractor in catalog deterministically
  const scoredTractors = tractorsList.map(tractor => {
    let score = 0;
    const reasons = [];

    // 1. HP match
    if (tractor.hp >= recommendedMinHp && tractor.hp <= recommendedMaxHp + 5) {
      score += 35;
      reasons.push(`Optimal ${tractor.hp} HP engine perfectly matches ${acres} acres workload`);
    } else if (tractor.hp >= recommendedMinHp - 3) {
      score += 20;
      reasons.push(`Viable ${tractor.hp} HP for entry-level work`);
    } else {
      score -= 10;
    }

    // 2. Budget compatibility
    if (tractor.price <= budget) {
      score += 25;
      reasons.push(`Well within budget at ₹${(tractor.price / 100000).toFixed(2)} Lakh`);
    } else if (tractor.price <= budget * 1.1) {
      score += 15;
      reasons.push(`Slightly above budget (₹${(tractor.price / 100000).toFixed(2)}L) but offers higher resale value`);
    } else {
      score -= 15;
    }

    // 3. Implement & PTO match
    if (hasRotavator) {
      if (tractor.ptoHp >= 42) {
        score += 20;
        reasons.push(`High PTO power (${tractor.ptoHp} HP) handles 6-7 ft Rotavator without engine RPM drop`);
      } else {
        score += 10;
        reasons.push(`Suitable for 5 ft rotavator`);
      }
    }

    // 4. Hydraulics / Lift capacity for Trolley & Plough
    if (requiresHeavyTrolley || hasHeavyImplement) {
      if (tractor.liftCapacityKg >= 1800) {
        score += 15;
        reasons.push(`Heavy hydraulic lift capacity (${tractor.liftCapacityKg} kg) excellent for 10-12 ton trolley`);
      } else {
        score += 5;
      }
    }

    // 5. Soil compatibility
    if (isHeavySoil && (tractor.drive.includes('4WD') || tractor.hp >= 50)) {
      score += 10;
      reasons.push(`Engine torque & grip well suited for heavy ${soilType} terrain`);
    }

    return {
      tractor,
      score,
      reasons
    };
  });

  // Sort by score descending
  scoredTractors.sort((a, b) => b.score - a.score);

  const bestMatch = scoredTractors[0] || null;
  
  // Find an alternative: higher capability upgrade or value pick
  let alternative = null;
  if (scoredTractors.length > 1) {
    // Prefer one with higher HP or heavy duty lift
    alternative = scoredTractors.slice(1).find(item => item.tractor.hp > (bestMatch?.tractor.hp || 0)) || scoredTractors[1];
  }

  return {
    recommendedHpRange: `${recommendedMinHp} - ${recommendedMaxHp} HP`,
    bestMatch,
    alternative,
    allRanked: scoredTractors
  };
}
