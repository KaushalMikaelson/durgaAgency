// Tractor Catalog, Stock & Unit Economics Router
import express from 'express';
import { db } from '../storage/db.js';

export const tractorsRouter = express.Router();

// Get all tractors
tractorsRouter.get('/', (req, res) => {
  const tractors = db.get('tractors');
  res.json({ success: true, data: tractors });
});

// Update tractor stock or details
tractorsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const tractors = db.get('tractors');
  const index = tractors.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Tractor not found' });
  }

  const updated = { ...tractors[index], ...req.body };
  if (updated.stockCount !== undefined) {
    updated.status = Number(updated.stockCount) > 0 ? 'In Stock' : 'Available to Order';
  }
  tractors[index] = updated;
  db.set('tractors', tractors);
  res.json({ success: true, data: updated });
});

// Add new tractor
tractorsRouter.post('/', (req, res) => {
  const tractorData = req.body;
  const tractors = db.get('tractors');
  const newTractor = {
    id: tractorData.id || `TRAC-${String(tractors.length + 1).padStart(3, '0')}`,
    brand: tractorData.brand || 'VST Zetor',
    model: tractorData.model || 'New Model',
    hp: Number(tractorData.hp) || 45,
    ptoHp: Number(tractorData.ptoHp) || 40,
    engineCc: Number(tractorData.engineCc) || 2800,
    cylinders: Number(tractorData.cylinders) || 3,
    liftCapacityKg: Number(tractorData.liftCapacityKg) || 1800,
    drive: tractorData.drive || '2WD',
    price: Number(tractorData.price) || 750000,
    dealerPurchaseCost: Number(tractorData.dealerPurchaseCost) || 680000,
    stockCount: Number(tractorData.stockCount) || 0,
    status: Number(tractorData.stockCount) > 0 ? 'In Stock' : 'Available to Order',
    chassisList: tractorData.chassisList || [],
    warranty: tractorData.warranty || '6 Years / 6000 Hours Warranty',
    compatibleImplements: tractorData.compatibleImplements || ["Rotavator", "Cultivator", "Trolley"]
  };
  tractors.push(newTractor);
  db.set('tractors', tractors);
  res.json({ success: true, data: newTractor });
});

// Get Unit Economics & True Landed Margin for a tractor model
tractorsRouter.get('/:id/unit-economics', (req, res) => {
  const { id } = req.params;
  const tractors = db.get('tractors');
  const expenses = db.get('expenses');
  const tractor = tractors.find(t => t.id === id);

  if (!tractor) {
    return res.status(404).json({ success: false, error: 'Tractor not found' });
  }

  // Find direct expenses tagged to this tractor model's chassis
  const matchedExpenses = expenses.filter(e => {
    if (!e.chassisTag) return false;
    return tractor.chassisList && tractor.chassisList.includes(e.chassisTag);
  });

  const directExpensesTotal = matchedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const purchaseCost = Number(tractor.dealerPurchaseCost || 0);
  const sellingPrice = Number(tractor.price || 0);
  const totalTrueCost = purchaseCost + directExpensesTotal;
  const actualMargin = sellingPrice - totalTrueCost;
  const marginPercent = totalTrueCost > 0 ? ((actualMargin / sellingPrice) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      tractor,
      purchaseCost,
      directExpenses: matchedExpenses,
      directExpensesTotal,
      totalTrueCost,
      sellingPrice,
      actualMargin,
      marginPercent
    }
  });
});
