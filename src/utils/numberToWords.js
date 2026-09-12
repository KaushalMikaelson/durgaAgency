// Authentic Hindi & English Currency Words Converter for Maa Durga Diesel Bill Book

const HINDI_UNITS = [
  '', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छः', 'सात', 'आठ', 'नौ', 'दस',
  'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
  'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस',
  'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस', 'चालीस',
  'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास', 'पचास',
  'इक्यावन', 'बावन', 'तिरेपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ', 'साठ',
  'इकसठ', 'बासठ', 'तिरेसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सरसठ', 'अड़सठ', 'उनहत्तर', 'सत्तर',
  'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उनासी', 'अस्सी',
  'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अठासी', 'नवासी', 'नब्बे',
  'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पंचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'
];

function convertHindiTwoDigit(n) {
  return HINDI_UNITS[n] || '';
}

export function numberToHindiWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'शून्य रुपये मात्र';
  if (n < 0) return 'ऋण ' + numberToHindiWords(Math.abs(n));

  let words = '';

  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) {
    words += `${numberToHindiWordsSimple(crore)} करोड़ `;
  }
  if (lakh > 0) {
    words += `${convertHindiTwoDigit(lakh)} लाख `;
  }
  if (thousand > 0) {
    words += `${convertHindiTwoDigit(thousand)} हजार `;
  }
  if (hundred > 0) {
    words += `${convertHindiTwoDigit(hundred)} सौ `;
  }
  if (rem > 0) {
    words += `${convertHindiTwoDigit(rem)} `;
  }

  return `${words.trim()} रुपये मात्र`;
}

function numberToHindiWordsSimple(n) {
  if (n < 100) return convertHindiTwoDigit(n);
  const hundred = Math.floor(n / 100);
  const rem = n % 100;
  let res = '';
  if (hundred > 0) res += `${convertHindiTwoDigit(hundred)} सौ `;
  if (rem > 0) res += `${convertHindiTwoDigit(rem)} `;
  return res.trim();
}
