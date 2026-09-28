// Print Modal and Layout for Maa Durga Diesel Bill Slip
import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { numberToHindiWords } from '../../utils/numberToWords.js';
import { formatToDMY } from '../../utils/dateUtils.js';
import { printBillWithUniqueTitle, getBillUniqueFileName } from '../../utils/billPrintUtils.js';

export function BillPrintModal({ bill, onClose }) {
  if (!bill) return null;

  const fileName = getBillUniqueFileName(bill);

  const handlePrint = () => {
    printBillWithUniqueTitle(bill);
  };

  const words = bill.amountWords || numberToHindiWords(bill.totalRupees || 0);

  return (
    <div className="bill-print-modal-overlay">
      <div className="bill-print-modal-actions no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          📄 File name: <strong style={{ color: '#1e3a8a' }}>{fileName}.pdf</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handlePrint} title={`Download / Save as ${fileName}.pdf`}>
            <Printer size={16} /> Print / Download PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            <X size={16} /> Close
          </button>
        </div>
      </div>

      <div className="printable-page-container">
        <div 
          className="maa-durga-slip print-only-target"
          data-bill-number={bill.billNumber}
          data-customer-name={bill.customerName}
          data-bill-date={bill.date}
          data-bill-name={bill.billName}
        >
          <div className="slip-ganesh">|| श्री गणेशाय नमः ||</div>
          <div className="slip-tag-estimate">ESTIMATE / CASH MEMO</div>

          <div className="slip-main-title">माँ दुर्गा डीजल</div>
          <div className="slip-subtitle">डीजल पम्प, नोजल एवं ट्रेक्टर के सामानों के विक्रेता</div>
          <div className="slip-address">बड़हलगंज रोड, दोहरीघाट, मऊ</div>

          <div className="slip-meta-grid">
            <div className="meta-row">
              <div className="meta-field flex-1">
                <span className="meta-lbl">No. / क्र.सं.:</span>
                <span className="dotted-val bold-red">{bill.billNumber}</span>
              </div>
              <div className="meta-field flex-1 text-right">
                <span className="meta-lbl">Date / दिनांक:</span>
                <span className="dotted-val bold-red">{formatToDMY(bill.date)}</span>
              </div>
            </div>

            <div className="meta-row">
              <div className="meta-field flex-1">
                <span className="meta-lbl">M/s / मेसर्स:</span>
                <span className="dotted-val bold-red">{bill.customerName}</span>
              </div>
            </div>

            <div className="meta-row">
              <div className="meta-field flex-2">
                <span className="meta-lbl">Address / पता:</span>
                <span className="dotted-val">{bill.address || '-'}</span>
              </div>
              <div className="meta-field flex-1">
                <span className="meta-lbl">Vehicle / गाड़ी:</span>
                <span className="dotted-val">{bill.vehicle || '-'}</span>
              </div>
              <div className="meta-field flex-1">
                <span className="meta-lbl">Mob / मो.:</span>
                <span className="dotted-val">{bill.phone || '-'}</span>
              </div>
            </div>
          </div>

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
                </tr>
              </thead>
              <tbody>
                {(bill.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-center">{idx + 1}</td>
                    <td>{item.description}</td>
                    <td className="text-center">{item.qty || '1'}</td>
                    <td className="text-right font-mono">
                      {item.rate ? `₹${Number(item.rate).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="text-right font-mono font-bold">
                      {item.amountRupees > 0 ? Number(item.amountRupees).toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="text-center font-mono">
                      {item.amountPaise > 0 ? String(item.amountPaise).padStart(2, '0') : '00'}
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
                    ₹{Number(bill.totalRupees || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="text-center font-bold font-mono">
                    {String(bill.totalPaise || 0).padStart(2, '0')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="slip-footer">
            <div className="slip-words-row">
              <span className="words-lbl">रुपये (शब्दों में):</span>
              <span className="words-val">{words}</span>
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
      </div>
    </div>
  );
}
