// Customer Leads & CRM Router
import express from 'express';
import { db } from '../storage/db.js';

export const leadsRouter = express.Router();

// Get all leads
leadsRouter.get('/', (req, res) => {
  const leads = db.get('leads');
  res.json({ success: true, data: leads });
});

// Create new lead
leadsRouter.post('/', (req, res) => {
  const leadData = req.body;
  const leads = db.get('leads');
  const newLead = {
    id: leadData.id || `LEAD-${Date.now()}`,
    name: leadData.name || 'New Farmer Enquiry',
    phone: leadData.phone || '',
    village: leadData.village || '',
    landAcres: Number(leadData.landAcres) || 0,
    soilType: leadData.soilType || 'Medium',
    crops: leadData.crops || [],
    budgetMax: Number(leadData.budgetMax) || 800000,
    interestedModelId: leadData.interestedModelId || '',
    interestedModel: leadData.interestedModel || '',
    stage: leadData.stage || 'New Enquiry',
    buyingScore: leadData.buyingScore !== undefined ? Number(leadData.buyingScore) : 70,
    financeRequired: Boolean(leadData.financeRequired),
    exchangeWanted: Boolean(leadData.exchangeWanted),
    nextAction: leadData.nextAction || 'Follow up with customer on tractor model and price',
    notes: leadData.notes || '',
    createdAt: new Date().toISOString()
  };

  leads.unshift(newLead);
  db.set('leads', leads);
  res.json({ success: true, data: newLead });
});

// Update lead
leadsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const leads = db.get('leads');
  const index = leads.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Lead not found' });
  }

  leads[index] = { ...leads[index], ...req.body };
  db.set('leads', leads);
  res.json({ success: true, data: leads[index] });
});

// Delete lead
leadsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  let leads = db.get('leads');
  leads = leads.filter(l => l.id !== id);
  db.set('leads', leads);
  res.json({ success: true, message: 'Lead deleted' });
});
