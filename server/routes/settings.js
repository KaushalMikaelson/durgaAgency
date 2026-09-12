// Dealership Showroom Settings Router
import express from 'express';
import { db } from '../storage/db.js';

export const settingsRouter = express.Router();

settingsRouter.get('/', (req, res) => {
  const showroom = db.read().showroom || {};
  res.json({ success: true, data: showroom });
});

settingsRouter.put('/', (req, res) => {
  const current = db.read();
  current.showroom = { ...current.showroom, ...req.body };
  db.write(current);
  res.json({ success: true, data: current.showroom });
});
