// Express Backend Server for Maa Durga Engineering OS
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const express = (await import('express')).default;
    const cors = (await import('cors')).default;

    const { billsRouter } = await import('./routes/bills.js');
    const { leadsRouter } = await import('./routes/leads.js');
    const { tractorsRouter } = await import('./routes/tractors.js');
    const { expensesRouter } = await import('./routes/expenses.js');
    const { cashflowRouter } = await import('./routes/cashflow.js');
    const { demosRouter } = await import('./routes/demos.js');
    const { settingsRouter } = await import('./routes/settings.js');
    const { aiAdvisorRouter } = await import('./routes/aiAdvisor.js');

    const app = express();

    app.use(cors());
    app.use(express.json());

    // API Route Registration
    app.use('/api/bills', billsRouter);
    app.use('/api/leads', leadsRouter);
    app.use('/api/tractors', tractorsRouter);
    app.use('/api/expenses', expensesRouter);
    app.use('/api/cashflow', cashflowRouter);
    app.use('/api/demos', demosRouter);
    app.use('/api/settings', settingsRouter);
    app.use('/api/ai', aiAdvisorRouter);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', time: new Date().toISOString(), server: 'Express.js' });
    });

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`[Express Server] Maa Durga Engineering API running at: http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.warn("[Server Notice] Express or CORS package not yet loaded, starting fallback HTTP API server...", err.message);
    startFallbackHttpServer();
  }
}

// Resilient zero-dependency fallback HTTP API server (guarantees zero downtime)
async function startFallbackHttpServer() {
  const http = (await import('node:http')).default;
  const { db } = await import('./storage/db.js');

  const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    const sendJson = (statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let parsedBody = {};
      try {
        if (body) parsedBody = JSON.parse(body);
      } catch (e) {}

      // Health
      if (pathname === '/api/health') {
        return sendJson(200, { status: 'ok', time: new Date().toISOString(), server: 'Native HTTP Fallback' });
      }

      // Bills
      if (pathname === '/api/bills/next-number') {
        const bills = db.get('bills');
        let maxNo = 20;
        for (const b of bills) {
          if (b.billNumber) {
            const num = parseInt(String(b.billNumber).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxNo) maxNo = num;
          }
        }
        return sendJson(200, { success: true, nextNumber: String(maxNo + 1) });
      }

      if (pathname === '/api/bills') {
        if (req.method === 'GET') {
          return sendJson(200, { success: true, data: db.get('bills') });
        }
        if (req.method === 'POST') {
          const bills = db.get('bills');
          const newBill = {
            id: parsedBody.id || `BILL-${Date.now()}`,
            billNumber: String(parsedBody.billNumber || bills.length + 21),
            date: parsedBody.date || new Date().toISOString().split('T')[0],
            customerName: parsedBody.customerName || 'मेसर्स ग्राहक',
            address: parsedBody.address || '',
            phone: parsedBody.phone || '',
            vehicle: parsedBody.vehicle || '',
            items: parsedBody.items || [],
            totalRupees: Number(parsedBody.totalRupees || 0),
            totalPaise: Number(parsedBody.totalPaise || 0),
            amountWords: parsedBody.amountWords || '',
            createdAt: new Date().toISOString()
          };
          const idx = bills.findIndex(b => b.id === newBill.id || String(b.billNumber) === String(newBill.billNumber));
          if (idx >= 0) bills[idx] = { ...bills[idx], ...newBill };
          else bills.unshift(newBill);
          db.set('bills', bills);
          return sendJson(200, { success: true, data: newBill });
        }
      }

      if (pathname.startsWith('/api/bills/')) {
        const id = pathname.replace('/api/bills/', '');
        if (req.method === 'DELETE') {
          let bills = db.get('bills');
          bills = bills.filter(b => b.id !== id && String(b.billNumber) !== id);
          db.set('bills', bills);
          return sendJson(200, { success: true, message: 'Deleted' });
        }
      }

      // Leads
      if (pathname === '/api/leads') {
        if (req.method === 'GET') return sendJson(200, { success: true, data: db.get('leads') });
        if (req.method === 'POST') {
          const leads = db.get('leads');
          const newLead = { id: `LEAD-${Date.now()}`, ...parsedBody, createdAt: new Date().toISOString() };
          leads.unshift(newLead);
          db.set('leads', leads);
          return sendJson(200, { success: true, data: newLead });
        }
      }

      if (pathname.startsWith('/api/leads/')) {
        const id = pathname.replace('/api/leads/', '');
        const leads = db.get('leads');
        const idx = leads.findIndex(l => l.id === id);
        if (req.method === 'PUT' && idx >= 0) {
          leads[idx] = { ...leads[idx], ...parsedBody };
          db.set('leads', leads);
          return sendJson(200, { success: true, data: leads[idx] });
        }
        if (req.method === 'DELETE') {
          db.set('leads', leads.filter(l => l.id !== id));
          return sendJson(200, { success: true, message: 'Deleted' });
        }
      }

      // Tractors
      if (pathname === '/api/tractors') {
        return sendJson(200, { success: true, data: db.get('tractors') });
      }

      // Expenses
      if (pathname === '/api/expenses') {
        if (req.method === 'GET') return sendJson(200, { success: true, data: db.get('expenses') });
        if (req.method === 'POST') {
          const expenses = db.get('expenses');
          const newExp = { id: `EXP-${Date.now()}`, ...parsedBody, createdAt: new Date().toISOString() };
          expenses.unshift(newExp);
          db.set('expenses', expenses);
          return sendJson(200, { success: true, data: newExp });
        }
      }

      // Cashflow
      if (pathname === '/api/cashflow') {
        if (req.method === 'GET') return sendJson(200, { success: true, data: db.get('cashTransactions') });
        if (req.method === 'POST') {
          const txns = db.get('cashTransactions');
          const newTxn = { id: `TXN-${Date.now()}`, ...parsedBody, createdAt: new Date().toISOString() };
          txns.unshift(newTxn);
          db.set('cashTransactions', txns);
          return sendJson(200, { success: true, data: newTxn });
        }
      }

      if (pathname === '/api/cashflow/snapshot') {
        const bills = db.get('bills');
        const expenses = db.get('expenses').filter(e => e.status === 'Approved');
        const txns = db.get('cashTransactions');
        const billRevenue = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
        let cashIn = 0, cashOut = 0;
        for (const t of txns) {
          if (t.type === 'IN') cashIn += Number(t.amount || 0);
          else if (t.type === 'OUT') cashOut += Number(t.amount || 0);
        }
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return sendJson(200, {
          success: true,
          data: { billRevenue, cashIn, cashOut, netCashFlow: cashIn - cashOut, totalExpenses }
        });
      }

      // Settings
      if (pathname === '/api/settings') {
        return sendJson(200, { success: true, data: db.read().showroom || {} });
      }

      // 404
      sendJson(404, { success: false, error: 'Endpoint not found' });
    });
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[HTTP API Server] Maa Durga Engineering API running at: http://127.0.0.1:${PORT}`);
  });
}

startServer();
