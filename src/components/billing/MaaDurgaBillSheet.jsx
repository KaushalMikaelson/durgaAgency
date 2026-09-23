// Authentic "माँ दुर्गा डीजल" Estimate / Cash Memo Interactive Bill Book
import React, { useState, useEffect } from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';
import { api } from '../../services/api.js';
import { numberToHindiWords } from '../../utils/numberToWords.js';
import { Printer, Save, Plus, Trash2, Zap } from 'lucide-react';

const PRESETS = [
  {
    name: "VST Zetor PDI & Delivery Kit",
    items: [
      { description: "हेवी ड्यूटी ट्रैक्टर कैनोपी (Canopy with Frame)", qty: "1", rate: 5200 },
      { description: "इंजन ऑयल टॉप-अप एवं ग्रीसिंग किट", qty: "1", rate: 1600 }
    ]
  },
  {
    name: "50-Hour First Service Kit",
    items: [
      { description: "VST Zetor 50-Hour First Service Kit (Oil & Filter)", qty: "1 सेट", rate: 4200 },
      { description: "डीजल फिल्टर प्राथमिक एवं द्वितीयक (Dual Filter)", qty: "2 पीस", rate: 450 },
      { description: "सर्विस एवं लेबर चार्ज (PDI & Greasing)", qty: "1", rate: 500 }
    ]
  },
  {
    name: "Rotavator Blades Set (42 Pcs)",
    items: [
      { description: "बोरोन स्टील रोटावेटर ब्लेड एल-टाइप (Boron Steel L-Type)", qty: "42 पीस", rate: 85 }
    ]
  },
  {
    name: "Diesel Fuel Filter Set",
    items: [
      { description: "डीजल फिल्टर प्राइमरी व सेकेंडरी सेट (MICO / Bosch)", qty: "2 सेट", rate: 450 }
    ]
  }
];

export function MaaDurgaBillSheet({ initialData = null, onClose, onPrintPreview }) {
  const { saveBill } = useDealership();

  const [billNumber, setBillNumber] = useState(initialData?.billNumber || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [vehicle, setVehicle] = useState(initialData?.vehicle || '');
  const [phone, setPhone] = useState(initialData?.phone || '');

  const [items, setItems] = useState(initialData?.items?.length ? initialData.items : [
    { slNo: 1, description: '', qty: '1', rate: '', amountRupees: 0, amountPaise: 0 },
    { slNo: 2, description: '', qty: '', rate: '', amountRupees: 0, amountPaise: 0 },
    { slNo: 3, description: '', qty: '', rate: '', amountRupees: 0, amountPaise: 0 },
    { slNo: 4, description: '', qty: '', rate: '', amountRupees: 0, amountPaise: 0 }
  ]);

  // Load next auto-incrementing bill number if creating new bill
  useEffect(() => {
    if (!initialData?.billNumber) {
      api.bills.getNextNumber().then((num) => {
        setBillNumber(num);
      });
    }
  }, [initialData]);

  // Row update helper
  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      // Compute amount if qty and rate are numeric
      const numericQty = parseFloat(String(item.qty).replace(/[^0-9.]/g, '')) || 1;
      const numericRate = parseFloat(item.rate) || 0;
      if (item.rate !== '' && !isNaN(numericRate)) {
        const total = numericQty * numericRate;
        item.amountRupees = Math.floor(total);
        item.amountPaise = Math.round((total - Math.floor(total)) * 100);
      } else {
        item.amountRupees = 0;
        item.amountPaise = 0;
      }

      next[index] = item;
      return next;
    });
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { slNo: prev.length + 1, description: '', qty: '', rate: '', amountRupees: 0, amountPaise: 0 }
    ]);
  };

  const removeRow = (idx) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, slNo: i + 1 })));
  };

  const applyPreset = (preset) => {
    const newItems = preset.items.map((it, idx) => {
      const numericQty = parseFloat(String(it.qty).replace(/[^0-9.]/g, '')) || 1;
      const total = numericQty * (it.rate || 0);
      return {
        slNo: idx + 1,
        description: it.description,
        qty: String(it.qty),
        rate: it.rate,
        amountRupees: Math.floor(total),
        amountPaise: 0
      };
    });
    setItems(newItems);
  };

  // Grand totals
  const totalRupees = items.reduce((sum, it) => sum + (Number(it.amountRupees) || 0), 0);
  const totalPaise = items.reduce((sum, it) => sum + (Number(it.amountPaise) || 0), 0);
  const adjustedRupees = totalRupees + Math.floor(totalPaise / 100);
  const adjustedPaise = totalPaise % 100;
  const hindiWords = numberToHindiWords(adjustedRupees);

  const handleSaveAndPrint = async (shouldPrint = false) => {
    const billPayload = {
      id: initialData?.id,
      billNumber: billNumber || '21',
      date,
      customerName: customerName.trim() || 'मेसर्स ग्राहक',
      address: address.trim(),
      vehicle: vehicle.trim(),
      phone: phone.trim(),
      items: items.filter(it => it.description && it.description.trim() !== ''),
      totalRupees: adjustedRupees,
      totalPaise: adjustedPaise,
      amountWords: hindiWords
    };

    const saved = await saveBill(billPayload);
    if (shouldPrint && onPrintPreview) {
      onPrintPreview(saved || billPayload);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="maa-durga-bill-wrapper">
      {/* Quick Presets Bar */}
      <div className="bill-presets-bar">
        <span className="presets-label"><Zap size={14} /> Quick Presets:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-tag-btn"
            onClick={() => applyPreset(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Authentic Physical Bill Slip Card */}
      <div className="maa-durga-slip" id="printableBillSlip">
        {/* Slip Top Header */}
        <div className="slip-ganesh">|| श्री गणेशाय नमः ||</div>
        <div className="slip-tag-estimate">ESTIMATE / CASH MEMO</div>

        <div className="slip-main-title">माँ दुर्गा डीजल</div>
        <div className="slip-subtitle">डीजल पम्प, नोजल एवं ट्रेक्टर के सामानों के विक्रेता</div>
        <div className="slip-address">बड़हलगंज रोड, दोहरीघाट, मऊ</div>

        {/* Slip Metadata Dotted Grid */}
        <div className="slip-meta-grid">
          <div className="meta-row">
            <div className="meta-field flex-1">
              <span className="meta-lbl">No. / क्र.सं.:</span>
              <input
                type="text"
                className="dotted-input bold-red"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="21"
              />
            </div>
            <div className="meta-field flex-1 text-right">
              <span className="meta-lbl">Date / दिनांक:</span>
              <input
                type="date"
                className="dotted-input bold-red"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="meta-row">
            <div className="meta-field flex-1">
              <span className="meta-lbl">M/s / मेसर्स:</span>
              <input
                type="text"
                className="dotted-input bold-red"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="किसान का नाम (Customer Name)"
              />
            </div>
          </div>

          <div className="meta-row">
            <div className="meta-field flex-2">
              <span className="meta-lbl">Address / पता:</span>
              <input
                type="text"
                className="dotted-input bold-red"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ग्राम / पोस्ट / जिला"
              />
            </div>
            <div className="meta-field flex-1">
              <span className="meta-lbl">Vehicle / गाड़ी:</span>
              <input
                type="text"
                className="dotted-input bold-red"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="UP53-..."
              />
            </div>
            <div className="meta-field flex-1">
              <span className="meta-lbl">Mob / मो.:</span>
              <input
                type="text"
                className="dotted-input bold-red"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98380..."
              />
            </div>
          </div>
        </div>

        {/* Authentic Dotted Items Table */}
        <div className="slip-table-container">
          <table className="slip-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>क्र.<br/><small>Sl.</small></th>
                <th>विवरण<br/><small>Particulars / Item Description</small></th>
                <th style={{ width: '90px' }}>मात्रा<br/><small>Qty.</small></th>
                <th style={{ width: '100px' }}>दर<br/><small>Rate</small></th>
                <th style={{ width: '110px' }}>रुपये<br/><small>Rs.</small></th>
                <th style={{ width: '45px' }}>पैसे<br/><small>P.</small></th>
                <th className="no-print" style={{ width: '35px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-center">{item.slNo}</td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="सामान का विवरण"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input text-center"
                      placeholder="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="table-input text-right"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                    />
                  </td>
                  <td className="text-right font-mono font-bold">
                    {item.amountRupees > 0 ? Number(item.amountRupees).toLocaleString('en-IN') : '-'}
                  </td>
                  <td className="text-center font-mono">
                    {item.amountPaise > 0 ? String(item.amountPaise).padStart(2, '0') : '00'}
                  </td>
                  <td className="no-print text-center">
                    <button
                      type="button"
                      className="row-del-btn"
                      onClick={() => removeRow(idx)}
                      title="Remove Row"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right font-bold slip-total-label">
                  कुल योग (TOTAL):
                </td>
                <td className="text-right font-bold font-mono slip-total-value">
                  ₹{Number(adjustedRupees).toLocaleString('en-IN')}
                </td>
                <td className="text-center font-bold font-mono">
                  {String(adjustedPaise).padStart(2, '0')}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Row Adder Button */}
        <div className="no-print slip-table-actions">
          <button type="button" className="btn-add-row" onClick={addRow}>
            <Plus size={14} /> पंक्ति जोड़ें (+ Add Row)
          </button>
        </div>

        {/* Hindi Words & Signatures Footer */}
        <div className="slip-footer">
          <div className="slip-words-row">
            <span className="words-lbl">रुपये (शब्दों में):</span>
            <span className="words-val">{hindiWords}</span>
          </div>

          <div className="slip-signs-row" style={{ justifyContent: 'flex-end' }}>
            <div className="sign-col shop-sign" style={{ textAlign: 'center' }}>
              <div style={{ height: '40px' }}></div>
              <div className="sign-line" style={{ width: '180px', margin: '0 auto 4px' }}></div>
              <span>हस्ताक्षर</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Toolbar */}
      <div className="slip-actions-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          Cancel / बंद करें
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSaveAndPrint(false)}
        >
          <Save size={16} /> सहेजें (Save Bill)
        </button>

        <button
          type="button"
          className="btn btn-print-primary"
          onClick={() => handleSaveAndPrint(true)}
        >
          <Printer size={16} /> सहेजें एवं प्रिंट करें (Save & Print)
        </button>
      </div>
    </div>
  );
}
