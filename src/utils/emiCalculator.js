// Tractor EMI, Subsidy & Harvest-Cycle Calculator for Maa Durga Engineering OS

export function calculateTractorLoan({
  tractorPrice,
  subsidyAmount = 0,
  downPayment = 0,
  tenureYears = 5,
  annualInterestRate = 10.5
}) {
  const price = Number(tractorPrice) || 0;
  const subsidy = Number(subsidyAmount) || 0;
  const down = Number(downPayment) || 0;
  const years = Number(tenureYears) || 5;
  const annualRate = Number(annualInterestRate) || 10.5;

  // Effective loan principal
  const netTractorCost = Math.max(0, price - subsidy);
  const loanPrincipal = Math.max(0, netTractorCost - down);

  const months = years * 12;
  const monthlyRate = annualRate / (12 * 100);

  let monthlyEmi = 0;
  if (loanPrincipal > 0 && monthlyRate > 0) {
    monthlyEmi = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  } else if (loanPrincipal > 0) {
    monthlyEmi = loanPrincipal / months;
  }

  const totalPayment = down + (monthlyEmi * months);
  const totalInterest = Math.max(0, totalPayment - down - loanPrincipal);

  // Harvest-Cycle (Bi-annual / 6-Month) installment tailored for Indian farmers (Rabi & Kharif harvest)
  const biAnnualInstallments = years * 2;
  const biAnnualRate = annualRate / (2 * 100);
  let biAnnualEmi = 0;
  if (loanPrincipal > 0 && biAnnualRate > 0) {
    biAnnualEmi = (loanPrincipal * biAnnualRate * Math.pow(1 + biAnnualRate, biAnnualInstallments)) / (Math.pow(1 + biAnnualRate, biAnnualInstallments) - 1);
  }

  return {
    netTractorCost: Math.round(netTractorCost),
    loanPrincipal: Math.round(loanPrincipal),
    downPayment: Math.round(down),
    subsidyAmount: Math.round(subsidy),
    tenureYears: years,
    annualInterestRate: annualRate,
    monthlyEmi: Math.round(monthlyEmi),
    biAnnualHarvestEmi: Math.round(biAnnualEmi),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalPayment),
    principalPercent: totalPayment > 0 ? Math.round((loanPrincipal / totalPayment) * 100) : 100,
    interestPercent: totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0
  };
}
