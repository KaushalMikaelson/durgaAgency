import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 5000;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

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

    // Serve static files if dist exists (production build)
    const distPath = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }

    // Root UI handler: redirect browser users to frontend UI (port 3000) or serve built client
    app.get('/', (req, res) => {
      if (fs.existsSync(path.join(distPath, 'index.html'))) {
        return res.sendFile(path.join(distPath, 'index.html'));
      }

      if (req.accepts('html')) {
        return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${CLIENT_URL}/">
  <title>Maa Durga Engineering OS - Redirecting...</title>
  <script>window.location.replace("${CLIENT_URL}/");</script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1329; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #131f37; padding: 2.5rem; border-radius: 16px; border: 1px solid #1e293b; text-align: center; max-width: 520px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5); }
    h1 { font-size: 1.4rem; margin: 0 0 0.5rem; color: #38bdf8; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin: 0 0 1.5rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: #2563eb; color: #fff; padding: 0.8rem 1.6rem; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .meta { font-size: 0.8rem; color: #64748b; margin-top: 1.25rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚜 Maa Durga Engineering OS</h1>
    <p>API Server is running on port ${PORT}.<br>Opening the interactive Web Application UI...</p>
    <a href="${CLIENT_URL}/" class="btn">Open Web App (${CLIENT_URL})</a>
    <div class="meta">If your browser doesn't automatically redirect, click the button above.</div>
  </div>
</body>
</html>`);
      }

      res.json({
        name: 'Maa Durga Engineering Dealership OS API',
        status: 'online',
        clientUrl: CLIENT_URL,
        health: '/api/health'
      });
    });

    // Non-API route fallback
    app.use((req, res) => {
      if (req.accepts('html') && !req.path.startsWith('/api')) {
        return res.redirect(`${CLIENT_URL}${req.originalUrl}`);
      }
      res.status(404).json({ success: false, error: 'Endpoint not found', apiDocs: '/api/health' });
    });

    const serverInstance = app.listen(PORT, '127.0.0.1', () => {
      console.log(`\n========================================================`);
      console.log(`[Express Server] Maa Durga Engineering API: http://127.0.0.1:${PORT}`);
      console.log(`[Express Server] ➜ Web Application UI:     ${CLIENT_URL}/`);
      console.log(`========================================================\n`);
    });
    serverInstance.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[Express Server] Port ${PORT} is already active, reusing existing API service.`);
      } else {
        console.error('[Express Server Error]', err);
      }
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

    if (pathname === '/' || (!pathname.startsWith('/api') && req.headers.accept?.includes('text/html'))) {
      res.writeHead(302, { 'Location': `${CLIENT_URL}/` });
      res.end();
      return;
    }

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
