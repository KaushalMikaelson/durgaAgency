// WhatsApp Follow-Up Automation & Template Generator for Maa Durga Engineering OS
import { SHOWROOM_INFO } from '../data.js';

export function generateFollowUpSequences(lead, tractor = null) {
  const customerName = lead.name || 'Kisan Bhai';
  const tractorName = tractor ? `${tractor.brand} ${tractor.model}` : (lead.interestedModel || 'Tractor');
  const acres = lead.landAcres ? `${lead.landAcres} acres` : 'your agricultural land';
  const village = lead.village ? `Village ${lead.village}` : '';

  const sequences = [
    {
      day: 1,
      title: "Day 1: Showroom Visit Gratitude & Shortlisted Model",
      subject: "Showroom Visit Follow-up",
      body: `Namaskar ${customerName} Ji 🙏\n\nThank you for visiting Maa Durga Engineering today! Based on your requirement for ${acres} in ${village}, we shortlisted the powerful ${tractorName}.\n\n✓ Best in class fuel efficiency\n✓ High lifting capacity & heavy duty gearbox\n✓ Complete 5-year warranty with authorized showroom service\n\nPlease find the technical brochure attached. Looking forward to serving your farm!\n\nRegards,\nSales Team | Maa Durga Engineering\nGorakhpur - ${SHOWROOM_INFO.phone}`
    },
    {
      day: 3,
      title: "Day 3: Rotavator & Heavy Implement Field Video",
      subject: "Tractor Working Video",
      body: `Namaskar ${customerName} Ji,\n\nHere is a short field demonstration video of the ${tractorName} operating with a 6-foot Rotavator in moist soil:\n\n📹 Watch Video: https://youtu.be/maadurga-field-demo\n\nNotice the zero RPM drop and smooth throttle response. Would you like our demonstration team to bring this tractor to your field in ${village} this week?\n\nRegards,\nMaa Durga Engineering`
    },
    {
      day: 7,
      title: "Day 7: Easy Kisan Loan & Low Harvest EMI Scheme",
      subject: "Finance & EMI Details",
      body: `Namaskar ${customerName} Ji,\n\nGreat news! We have an exclusive festive financing tie-up with State Bank of India & HDFC Bank for the ${tractorName}.\n\n💰 Down payment: Easy minimum token\n🌾 Harvest-Cycle EMI: Pay only after Rabi & Kharif crop sales!\n📄 Simple documentation with 24-hour sanction.\n\nShall we process your loan paperwork & price estimate today?\n\nRegards,\nFinance Desk | Maa Durga Engineering`
    },
    {
      day: 14,
      title: "Day 14: Seasonal Booking Check-in & Price Protection",
      subject: "Seasonal Booking Alert",
      body: `Namaskar ${customerName} Ji,\n\nThe harvest season is beginning and factory stock of ${tractorName} is moving quickly. Are you still planning to take delivery this season?\n\nIf you book before this Sunday, we will provide a FREE heavy tractor canopy + 1st year free service kit.\n\nReply 'YES' to reserve your chassis number.\n\nRegards,\nDirector, Maa Durga Engineering`
    }
  ];

  return sequences;
}

export function createWhatsAppUrl(phone, messageText) {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}
