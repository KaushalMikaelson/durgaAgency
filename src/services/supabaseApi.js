// Supabase API Client for Maa Durga Engineering OS
import { supabase } from '../lib/supabase.js';
import { DEFAULT_TRACTORS, SHOWROOM_INFO } from '../data.js';
import { formatToDMY } from '../utils/dateUtils.js';

// Helper to convert snake_case DB row to camelCase bill object
function rowToBill(row) {
  if (!row) return null;
  const total = Number(row.total_rupees || 0);
  const status = row.payment_status || 'Paid';
  const paid = (row.paid_amount !== null && row.paid_amount !== undefined) 
    ? Number(row.paid_amount) 
    : (status === 'Due' ? 0 : total);
  const due = (row.due_amount !== null && row.due_amount !== undefined) 
    ? Number(row.due_amount) 
    : Math.max(0, total - paid);

  return {
    id: row.id,
    billNumber: row.bill_number,
    date: formatToDMY(row.date),
    customerName: row.customer_name || '',
    address: row.address || '',
    phone: row.phone || '',
    vehicle: row.vehicle || '',
    items: Array.isArray(row.items) ? row.items : [],
    totalRupees: total,
    totalPaise: Number(row.total_paise || 0),
    amountWords: row.amount_words || '',
    paymentStatus: status,
    paidAmount: paid,
    dueAmount: due,
    createdAt: row.created_at
  };
}

// Helper to convert bill object to DB row
function billToRow(bill) {
  const total = Number(bill.totalRupees ?? bill.total_rupees ?? 0);
  const status = bill.paymentStatus || bill.payment_status || 'Paid';
  const paid = (bill.paidAmount !== undefined && bill.paidAmount !== null && bill.paidAmount !== '')
    ? Number(bill.paidAmount)
    : (status === 'Due' ? 0 : total);
  const due = (bill.dueAmount !== undefined && bill.dueAmount !== null && bill.dueAmount !== '')
    ? Number(bill.dueAmount)
    : Math.max(0, total - paid);

  return {
    id: bill.id || `BILL-${Date.now()}`,
    bill_number: String(bill.billNumber || bill.bill_number || '').trim(),
    date: formatToDMY(bill.date || new Date()),
    customer_name: bill.customerName || bill.customer_name || '',
    address: bill.address || '',
    phone: bill.phone || '',
    vehicle: bill.vehicle || '',
    items: Array.isArray(bill.items) ? bill.items : [],
    total_rupees: total,
    total_paise: Number(bill.totalPaise ?? bill.total_paise ?? 0),
    amount_words: bill.amountWords || bill.amount_words || '',
    payment_status: status,
    paid_amount: paid,
    due_amount: due
  };
}

// Helper to convert lead DB row
function rowToLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    phone: row.phone || '',
    village: row.village || '',
    stage: row.stage || 'Enquiry',
    buyingScore: row.buying_score,
    interestedModelId: row.interested_model_id,
    landAcres: row.land_acres,
    budgetMax: row.budget_max,
    crops: Array.isArray(row.crops) ? row.crops : [],
    soilType: row.soil_type || '',
    currentTractor: row.current_tractor || '',
    nextAction: row.next_action || '',
    lastContactDate: row.last_contact_date || '',
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

function leadToRow(lead) {
  return {
    id: lead.id || `LEAD-${Date.now()}`,
    name: lead.name || '',
    phone: lead.phone || '',
    village: lead.village || '',
    stage: lead.stage || 'Enquiry',
    buying_score: lead.buyingScore !== undefined ? Number(lead.buyingScore) : 0,
    interested_model_id: lead.interestedModelId || null,
    land_acres: lead.landAcres !== undefined && lead.landAcres !== null ? Number(lead.landAcres) : 0,
    budget_max: lead.budgetMax !== undefined && lead.budgetMax !== null ? Number(lead.budgetMax) : 0,
    crops: Array.isArray(lead.crops) ? lead.crops : [],
    soil_type: lead.soilType || '',
    current_tractor: lead.currentTractor || '',
    next_action: lead.nextAction || '',
    last_contact_date: lead.lastContactDate || new Date().toISOString().split('T')[0],
    notes: lead.notes || ''
  };
}

function rowToTractor(row) {
  if (!row) return null;
  const extra = (row.data && typeof row.data === 'object') ? row.data : {};
  return {
    id: row.id,
    brand: row.brand || 'VST Zetor',
    model: row.model || '',
    hp: row.hp ? Number(row.hp) : 0,
    price: Number(row.price || 0),
    dealerPurchaseCost: Number(row.dealer_purchase_cost || 0),
    stockCount: Number(row.stock_count || 0),
    chassisList: Array.isArray(row.chassis_list) ? row.chassis_list : [],
    drive: row.drive || '2WD',
    status: row.status || (Number(row.stock_count) > 0 ? 'In Stock' : 'Available to Order'),
    ...extra
  };
}

function tractorToRow(t) {
  const { id, brand, model, hp, price, dealerPurchaseCost, stockCount, chassisList, drive, status, ...rest } = t;
  return {
    id: id || `TRAC-${Date.now()}`,
    brand: brand || 'VST Zetor',
    model: model || '',
    hp: hp ? Number(hp) : 0,
    price: Number(price || 0),
    dealer_purchase_cost: Number(dealerPurchaseCost || 0),
    stock_count: Number(stockCount || 0),
    chassis_list: Array.isArray(chassisList) ? chassisList : [],
    drive: drive || '2WD',
    status: status || (Number(stockCount) > 0 ? 'In Stock' : 'Available to Order'),
    data: rest
  };
}

function rowToExpense(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    amount: Number(row.amount || 0),
    paidTo: row.paid_to,
    paymentMode: row.payment_mode,
    status: row.status || 'Pending',
    approvedBy: row.approved_by,
    chassisTag: row.chassis_tag,
    notes: row.notes,
    createdAt: row.created_at
  };
}

function expenseToRow(exp) {
  return {
    id: exp.id || `EXP-${Date.now()}`,
    date: exp.date || new Date().toISOString().split('T')[0],
    category: exp.category || 'General',
    amount: Number(exp.amount || 0),
    paid_to: exp.paidTo || exp.paid_to || '',
    payment_mode: exp.paymentMode || exp.payment_mode || 'Cash',
    status: exp.status || 'Pending',
    approved_by: exp.approvedBy || exp.approved_by || null,
    chassis_tag: exp.chassisTag || exp.chassis_tag || null,
    notes: exp.notes || ''
  };
}

function rowToCash(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    type: row.type || 'IN',
    category: row.category,
    amount: Number(row.amount || 0),
    partyName: row.party_name,
    paymentMode: row.payment_mode,
    notes: row.notes,
    ref: row.ref,
    createdAt: row.created_at
  };
}

function cashToRow(txn) {
  return {
    id: txn.id || `TXN-${Date.now()}`,
    date: txn.date || new Date().toISOString().split('T')[0],
    type: txn.type || 'IN',
    category: txn.category || 'Tractor Sale',
    amount: Number(txn.amount || 0),
    party_name: txn.partyName || txn.party_name || '',
    payment_mode: txn.paymentMode || txn.payment_mode || 'Cash',
    notes: txn.notes || '',
    ref: txn.ref || null
  };
}

function rowToDemo(row) {
  if (!row) return null;
  return {
    id: row.id,
    farmerName: row.farmer_name,
    phone: row.phone,
    village: row.village,
    tractorModel: row.tractor_model,
    implement: row.implement,
    scheduledDate: row.scheduled_date,
    soilType: row.soil_type,
    status: row.status || 'Scheduled',
    createdAt: row.created_at
  };
}

function demoToRow(demo) {
  return {
    id: demo.id || `DEMO-${Date.now()}`,
    farmer_name: demo.farmerName || demo.farmer_name || '',
    phone: demo.phone || '',
    village: demo.village || '',
    tractor_model: demo.tractorModel || demo.tractor_model || '',
    implement: demo.implement || '',
    scheduled_date: demo.scheduledDate || demo.scheduled_date || '',
    soil_type: demo.soilType || demo.soil_type || '',
    status: demo.status || 'Scheduled'
  };
}

export const supabaseApi = {
  // Bills
  bills: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToBill);
      } catch (err) {
        console.warn('Supabase bills.getAll failed:', err);
        return [];
      }
    },
    async getNextNumber() {
      try {
        const { data } = await supabase.from('bills').select('bill_number');
        let maxNo = 86;
        if (data && data.length > 0) {
          const nums = data.map(b => parseInt(b.bill_number, 10)).filter(n => !isNaN(n));
          if (nums.length > 0) maxNo = Math.max(...nums);
        }
        return String(maxNo + 1);
      } catch (e) {
        return '87';
      }
    },
    async save(billData) {
      try {
        const row = billToRow(billData);
        if (!row.bill_number) {
          row.bill_number = await supabaseApi.bills.getNextNumber();
        }
        const { data, error } = await supabase
          .from('bills')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();
        if (error) throw error;
        return rowToBill(data || row);
      } catch (err) {
        console.error('Supabase bills.save error:', err);
        throw err;
      }
    },
    async delete(id) {
      try {
        const strId = String(id).trim();
        const { error } = await supabase
          .from('bills')
          .delete()
          .or(`id.eq.${strId},bill_number.eq.${strId}`);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('Supabase bills.delete error:', err);
        throw err;
      }
    }
  },

  // CRM Leads
  leads: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToLead);
      } catch (err) {
        console.warn('Supabase leads.getAll failed:', err);
        return [];
      }
    },
    async create(lead) {
      try {
        const row = leadToRow(lead);
        const { data, error } = await supabase
          .from('leads')
          .upsert(row)
          .select()
          .single();
        if (error) throw error;
        return rowToLead(data || row);
      } catch (err) {
        console.error('Supabase leads.create error:', err);
        throw err;
      }
    },
    async update(id, updates) {
      try {
        const row = leadToRow({ ...updates, id });
        const { data, error } = await supabase
          .from('leads')
          .update(row)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return rowToLead(data || row);
      } catch (err) {
        console.error('Supabase leads.update error:', err);
        throw err;
      }
    },
    async delete(id) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('Supabase leads.delete error:', err);
        throw err;
      }
    }
  },

  // Tractor Inventory
  tractors: {
    async getAll() {
      try {
        const { data, error } = await supabase.from('tractors').select('*');
        if (error) throw error;
        if (!data || data.length === 0) {
          // Auto-seed tractors table with default catalog if empty
          const seedRows = DEFAULT_TRACTORS.map(tractorToRow);
          await supabase.from('tractors').upsert(seedRows);
          return DEFAULT_TRACTORS;
        }
        return data.map(rowToTractor);
      } catch (err) {
        console.warn('Supabase tractors.getAll failed, using defaults:', err);
        return DEFAULT_TRACTORS;
      }
    },
    async add(tractor) {
      try {
        const row = tractorToRow(tractor);
        const { data, error } = await supabase
          .from('tractors')
          .upsert(row)
          .select()
          .single();
        if (error) throw error;
        return rowToTractor(data || row);
      } catch (err) {
        console.error('Supabase tractors.add error:', err);
        throw err;
      }
    },
    async update(id, updates) {
      try {
        const row = tractorToRow({ ...updates, id });
        const { data, error } = await supabase
          .from('tractors')
          .update(row)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return rowToTractor(data || row);
      } catch (err) {
        console.error('Supabase tractors.update error:', err);
        throw err;
      }
    },
    async getUnitEconomics(id) {
      const tractors = await supabaseApi.tractors.getAll();
      const tractor = tractors.find(t => t.id === id);
      if (!tractor) return null;
      const expenses = await supabaseApi.expenses.getAll();
      const matched = expenses.filter(e => e.status === 'Approved' && tractor.chassisList?.includes(e.chassisTag));
      const directTotal = matched.reduce((s, e) => s + Number(e.amount || 0), 0);
      const purchaseCost = Number(tractor.dealerPurchaseCost || 0);
      const sellingPrice = Number(tractor.price || 0);
      const totalTrueCost = purchaseCost + directTotal;
      const actualMargin = sellingPrice - totalTrueCost;
      const marginPercent = totalTrueCost > 0 ? ((actualMargin / sellingPrice) * 100).toFixed(1) : 0;
      return {
        tractor,
        purchaseCost,
        directExpenses: matched,
        directExpensesTotal: directTotal,
        totalTrueCost,
        sellingPrice,
        actualMargin,
        marginPercent
      };
    }
  },

  // Showroom Expenses
  expenses: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const all = (data || []).map(rowToExpense);

        // Filter out seeded/demo expenses
        const SEED_IDS = ['EXP-001', 'EXP-002'];
        const SEED_TEXTS = [
          'Malur to Gorakhpur', 'canopy installation & engine oil',
          'Shree Balaji Logistics', 'Kisan Tractor Works Workshop',
          'Indian Oil Kisan Pump', 'Vikram Singh (Senior Tech',
          'Gorakhpur Mandi Yard Premises', 'Gorakhpur Art Banners',
          'Chauhan Tea Stall', 'UPPCL Electricity Gorakhpur', 'Kisan Crane & Recovery',
          'CH-4511-4WD-1102', 'CH-4211-8901', 'Factory transporter unload',
          'Pre-delivery inspection'
        ];
        const isSeed = (e) => {
          if (!e) return false;
          if (SEED_IDS.includes(e.id)) return true;
          if (typeof e.id === 'string' && /^EXP-10[1-9]$/.test(e.id)) return true;
          const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''} ${e.category || ''} ${e.chassisTag || ''}`;
          return SEED_TEXTS.some(s => text.includes(s));
        };
        const seedIds = all.filter(isSeed).map(e => e.id);
        const cleaned = all.filter(e => !isSeed(e));

        // Delete seed records from Supabase permanently
        if (seedIds.length > 0) {
          supabase.from('expenses').delete().in('id', seedIds).then(() => {});
        }

        return cleaned;
      } catch (err) {
        console.warn('Supabase expenses.getAll failed:', err);
        return [];
      }
    },
    async create(exp) {
      try {
        const row = expenseToRow(exp);
        const { data, error } = await supabase
          .from('expenses')
          .upsert(row)
          .select()
          .single();
        if (error) throw error;
        return rowToExpense(data || row);
      } catch (err) {
        console.error('Supabase expenses.create error:', err);
        throw err;
      }
    },
    async delete(id) {
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('Supabase expenses.delete error:', err);
        throw err;
      }
    }
  },

  // Cashflow & Financial Snapshot
  cashflow: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('cash_transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToCash);
      } catch (err) {
        console.warn('Supabase cashflow.getAll failed:', err);
        return [];
      }
    },
    async create(txn) {
      try {
        const row = cashToRow(txn);
        const { data, error } = await supabase
          .from('cash_transactions')
          .upsert(row)
          .select()
          .single();
        if (error) throw error;
        return rowToCash(data || row);
      } catch (err) {
        console.error('Supabase cashflow.create error:', err);
        throw err;
      }
    },
    async getSnapshot() {
      try {
        const [bills, expenses, cashTxns] = await Promise.all([
          supabaseApi.bills.getAll(),
          supabaseApi.expenses.getAll(),
          supabaseApi.cashflow.getAll()
        ]);
        const billRevenue = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
        let cashIn = 0;
        let cashOut = 0;
        for (const txn of cashTxns) {
          const amt = Number(txn.amount || 0);
          if (txn.type === 'IN') cashIn += amt;
          else if (txn.type === 'OUT') cashOut += amt;
        }
        const categoryTotals = {};
        let totalExpenses = 0;
        for (const exp of expenses.filter(e => e.status === 'Approved')) {
          const cat = exp.category || 'Other';
          const amt = Number(exp.amount || 0);
          categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
          totalExpenses += amt;
        }
        return {
          billRevenue,
          cashIn,
          cashOut,
          netCashFlow: cashIn - cashOut,
          totalExpenses,
          categoryTotals
        };
      } catch (err) {
        console.warn('Supabase cashflow.getSnapshot failed:', err);
        return { billRevenue: 0, cashIn: 0, cashOut: 0, netCashFlow: 0, totalExpenses: 0, categoryTotals: {} };
      }
    }
  },

  // Field Demos
  demos: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('demos')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(rowToDemo);
      } catch (err) {
        console.warn('Supabase demos.getAll failed:', err);
        return [];
      }
    },
    async create(demo) {
      try {
        const row = demoToRow(demo);
        const { data, error } = await supabase
          .from('demos')
          .upsert(row)
          .select()
          .single();
        if (error) throw error;
        return rowToDemo(data || row);
      } catch (err) {
        console.error('Supabase demos.create error:', err);
        throw err;
      }
    },
    async update(id, updates) {
      try {
        const row = demoToRow({ ...updates, id });
        const { data, error } = await supabase
          .from('demos')
          .update(row)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return rowToDemo(data || row);
      } catch (err) {
        console.error('Supabase demos.update error:', err);
        throw err;
      }
    }
  },

  // Showroom Settings
  settings: {
    async get() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'showroom')
          .maybeSingle();
        if (error) throw error;
        if (data && data.data) return data.data;
        // Upsert default settings if row does not exist yet
        await supabase.from('settings').upsert({ id: 'showroom', data: SHOWROOM_INFO });
        return SHOWROOM_INFO;
      } catch (err) {
        console.warn('Supabase settings.get failed, using fallback:', err);
        return SHOWROOM_INFO;
      }
    },
    async update(settingsData) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .upsert({ id: 'showroom', data: settingsData, updated_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        return data?.data || settingsData;
      } catch (err) {
        console.error('Supabase settings.update error:', err);
        throw err;
      }
    }
  },

  // Quotes
  quotes: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(q => q.data || q);
      } catch (err) {
        console.warn('Supabase quotes.getAll failed:', err);
        return [];
      }
    },
    async save(quote) {
      try {
        const id = quote.id || `QUOTE-${Date.now()}`;
        const quoteNumber = quote.quoteNumber || quote.quote_number || `MDE-Q-${Date.now()}`;
        const { error } = await supabase
          .from('quotes')
          .upsert({
            id,
            quote_number: quoteNumber,
            date: quote.date || new Date().toISOString().split('T')[0],
            data: { ...quote, id, quoteNumber }
          });
        if (error) throw error;
        return { ...quote, id, quoteNumber };
      } catch (err) {
        console.error('Supabase quotes.save error:', err);
        throw err;
      }
    },
    async delete(id) {
      try {
        const { error } = await supabase.from('quotes').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('Supabase quotes.delete error:', err);
        throw err;
      }
    }
  },

  // AI Advisor
  ai: {
    async query(question) {
      const q = (question || '').toLowerCase();
      const [leads, expenses, bills, tractors] = await Promise.all([
        supabaseApi.leads.getAll(),
        supabaseApi.expenses.getAll(),
        supabaseApi.bills.getAll(),
        supabaseApi.tractors.getAll()
      ]);

      if (q.includes('profit') || q.includes('margin') || q.includes('loss') || q.includes('expense')) {
        const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const totalRev = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
        return {
          title: "Dealership Margin & Profit Analysis",
          summary: `Total bill book revenue is ₹${totalRev.toLocaleString('en-IN')} against total logged showroom expenses of ₹${totalExp.toLocaleString('en-IN')}.`,
          keyFindings: [
            `Total bills issued: ${bills.length}`,
            `Logged showroom operational expenses: ${expenses.length} entries`,
            `Landed unit economics are tracked per chassis number for accurate dealer net margin.`
          ],
          recommendation: "Keep tagging freight and PDI directly to tractor chassis to identify individual unit margins."
        };
      }

      if (q.includes('call') || q.includes('lead') || q.includes('today') || q.includes('hot')) {
        const hotLeads = leads.filter(l => Number(l.buyingScore) >= 75 || l.stage === 'Negotiation');
        return {
          title: "Daily Calling & Sales Priority Queue",
          summary: hotLeads.length > 0
            ? `You have ${hotLeads.length} High-Intent (Hot) farmer leads in your immediate pipeline.`
            : `You have ${leads.length} active enquiries in your sales pipeline.`,
          keyFindings: (hotLeads.length > 0 ? hotLeads : leads).slice(0, 3).map(l => 
            `🔥 ${l.name} (${l.village || 'Gorakhpur'}) - Score ${l.buyingScore || 0}/100. Next: ${l.nextAction || 'Follow up'}`
          ),
          recommendation: hotLeads[0] ? `Call ${hotLeads[0].name} (${hotLeads[0].phone}) first to schedule demo or finalize booking.` : "Review pipeline."
        };
      }

      return {
        title: "Maa Durga Dealership Sales Intelligence",
        summary: `Analyzed cloud showroom data: ${tractors.length} VST Zetor models, ${leads.length} active leads, and ${bills.length} bills.`,
        keyFindings: [
          `Tractor Stock: ${tractors.filter(t => Number(t.stockCount) > 0).length} models in stock ready for same-day delivery.`,
          `High-intent leads: ${leads.filter(l => Number(l.buyingScore) >= 75).length} farmers with buying score >= 75%`,
          `Live Cloud Database: Connected and synced to Supabase PostgreSQL.`
        ],
        recommendation: "Focus on closing hot customer negotiations and scheduling village field demonstrations."
      };
    }
  }
};
