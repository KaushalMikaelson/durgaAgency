// Field Demos Router
import express from 'express';
import { db } from '../storage/db.js';

export const demosRouter = express.Router();

demosRouter.get('/', (req, res) => {
  res.json({ success: true, data: db.get('demos') });
});

demosRouter.post('/', (req, res) => {
  const demoData = req.body;
  const demos = db.get('demos');
  const newDemo = {
    id: demoData.id || `DEMO-${Date.now()}`,
    farmerName: demoData.farmerName || 'Farmer Name',
    phone: demoData.phone || '',
    village: demoData.village || '',
    tractorModel: demoData.tractorModel || 'VST Zetor 4511 4WD',
    implement: demoData.implement || 'Rotavator (6 ft)',
    scheduledDate: demoData.scheduledDate || new Date().toISOString().split('T')[0],
    soilType: demoData.soilType || 'Medium',
    status: demoData.status || 'Scheduled',
    createdAt: new Date().toISOString()
  };
  demos.unshift(newDemo);
  db.set('demos', demos);
  res.json({ success: true, data: newDemo });
});

demosRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const demos = db.get('demos');
  const idx = demos.findIndex(d => d.id === id);
  if (idx !== -1) {
    demos[idx] = { ...demos[idx], ...req.body };
    db.set('demos', demos);
    return res.json({ success: true, data: demos[idx] });
  }
  res.status(404).json({ success: false, error: 'Demo not found' });
});
