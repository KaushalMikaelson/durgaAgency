// Intelligent Expense Category Auto-Classifier for Dealership OS
// Automatically maps purpose, notes, and vendor descriptions into official dealership categories

export const EXPENSE_CATEGORIES = [
  'Fuel',
  'Transport',
  'Repairs & PDI',
  'Salaries',
  'Showroom Rent',
  'Advertising',
  'Electricity',
  'Customer & Tea/Food',
  'Miscellaneous'
];

/**
 * Classifies an expense into an official category based on textual clues.
 * @param {string} text - Purpose, notes, or vendor description
 * @param {string} [currentCategory] - Existing category (if any)
 * @returns {string} The allocated category name
 */
export function autoDetectExpenseCategory(text, currentCategory = '') {
  if (!text || typeof text !== 'string') {
    return currentCategory || 'Miscellaneous';
  }

  const str = text.toLowerCase().trim();
  if (!str) return currentCategory || 'Miscellaneous';

  // 1. Customer Tea / Hospitality / Snacks
  if (
    /\b(tea|chai|chai-paani|chaipani|chay|coffee|nashta|nasta|breakfast|lunch|dinner|food|snack|snacks|samosa|samosas|biscuit|biscuits|mithai|sweets|sweet|water|bisleri|cold\s*drink|colddrink|hospitality|refreshment|refreshments|guest)\b/i.test(str)
  ) {
    return 'Customer & Tea/Food';
  }

  // 2. Repairs, Servicing & PDI (specifically pump service, tractor repair, mobil oil, lathe, etc.)
  if (
    /\b(pump\s*service|diesel\s*pump\s*service|fip\s*service|fip|nozzle|injector|service|servicing|repair|repairs|pdi|mechanic|mistry|mistri|teflon|grease|greasing|mobil|engine\s*oil|oil\s*change|filter|diesel\s*filter|air\s*filter|spare|spares|spare\s*parts|parts|battery|tyre|tire|tubeless|puncture|washing|car\s*wash|tractor\s*wash|welding|lathe|alignment|clutch|brake|hydraulic|chassis\s*repair)\b/i.test(str)
  ) {
    return 'Repairs & PDI';
  }

  // 3. Fuel & Diesel (petrol pump fuel purchase, diesel for tractor delivery / van)
  if (
    /\b(diesel|petrol|fuel|cng|petrol\s*pump|fuel\s*station|hpcl|bpcl|ioc|iocl|tank\s*full|refuel)\b/i.test(str)
  ) {
    return 'Fuel';
  }

  // 4. Inward Freight / Transport
  if (
    /\b(transport|transporter|logistics|freight|bhada|kiraya\s*gaadi|trolley|carrier|truck|lorry|unloading|loading|crane|recovery|towing|toll|challan|rto)\b/i.test(str)
  ) {
    return 'Transport';
  }

  // 5. Staff Salaries & Advances
  if (
    /\b(salary|salaries|advance|staff|worker|workers|mechanic\s*salary|driver|wages|vetan|tankha|tanha|incentive|bonus)\b/i.test(str)
  ) {
    return 'Salaries';
  }

  // 6. Showroom & Yard Rent
  if (
    /\b(showroom\s*rent|yard\s*rent|godown\s*rent|rent|kiraya|lease|mandi\s*yard)\b/i.test(str)
  ) {
    return 'Showroom Rent';
  }

  // 7. Electricity & Utilities
  if (
    /\b(electricity|bijli|power|uppcl|light\s*bill|electric\s*bill|utility|utilities|water\s*bill)\b/i.test(str)
  ) {
    return 'Electricity';
  }

  // 8. Advertising & Marketing
  if (
    /\b(ad|ads|advertising|banner|banners|flex|hoarding|poster|posters|wall\s*painting|marketing|pamphlet|pamphlets|leaflet|facebook|instagram|promotion)\b/i.test(str)
  ) {
    return 'Advertising';
  }

  return currentCategory || 'Miscellaneous';
}

/**
 * Normalizes an expense object to ensure accurate automated category allocation.
 * @param {Object} expense 
 * @returns {Object} normalized expense
 */
export function allocateExpenseCategory(expense) {
  if (!expense) return expense;
  const combinedText = `${expense.notes || ''} ${expense.paidTo || ''} ${expense.description || ''}`;
  const detected = autoDetectExpenseCategory(combinedText, expense.category);
  
  // If detected category differs from current (or current is generic/default), update it
  if (detected && detected !== expense.category) {
    return {
      ...expense,
      category: detected
    };
  }
  return expense;
}
