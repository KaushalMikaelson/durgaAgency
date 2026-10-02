// Print Modal and Layout for Maa Durga Diesel Bill Slip
import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { numberToHindiWords } from '../../utils/numberToWords.js';
import { formatToDMY } from '../../utils/dateUtils.js';
import { printBillWithUniqueTitle, getBillUniqueFileName } from '../../utils/billPrintUtils.js';

function isServiceItem(item) {
  if (item.isService !== undefined && item.isService !== null) return Boolean(item.isService);
  const text = (item.description || item.desc || '').toLowerCase();
  return /सर्विस|लेबर|चार्ज|ग्रीसिंग|धुलाई|फिटिंग|मैकेनिक|मजदूरी|किराया|भाड़ा|service|labor|charge|fitting|greas|wash|mechanic/i.test(text);
}

export function BillPrintModal({ bill, onClose }) {
  if (!bill) return null;

  const fileName = getBillUniqueFileName(bill);

  const handlePrint = () => {
    printBillWithUniqueTitle(bill);
  };

  const words = bill.amountWords || numberToHindiWords(bill.totalRupees || 0);

  const rawItems = bill.items || [];
  const regularItems = rawItems.filter(it => !isServiceItem(it));
  const serviceItems = rawItems.filter(it => isServiceItem(it));

  const regularTotal = regularItems.reduce((sum, it) => sum + (Number(it.amountRupees || it.rupees) || 0), 0);
  const serviceTotal = serviceItems.reduce((sum, it) => sum + (Number(it.amountRupees || it.rupees) || 0), 0);

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
                {/* Regular Items */}
                {regularItems.map((item, idx) => {
                  const amtRupees = item.amountRupees !== undefined ? item.amountRupees : item.rupees;
                  const amtPaise = item.amountPaise !== undefined ? item.amountPaise : item.paise;
                  return (
                    <tr key={`reg-${idx}`}>
                      <td className="text-center">{idx + 1}</td>
                      <td>{item.description || item.desc}</td>
                      <td className="text-center">{item.qty || '1'}</td>
                      <td className="text-right font-mono">
                        {item.rate ? `₹${Number(item.rate).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="text-right font-mono font-bold">
                        {amtRupees > 0 ? Number(amtRupees).toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="text-center font-mono">
                        {amtPaise > 0 ? String(amtPaise).padStart(2, '0') : '00'}
                      </td>
                    </tr>
                  );
                })}

                {/* Service Charges Section Divider (Placed at Bottom) */}
                {serviceItems.length > 0 && (
                  <tr className="slip-service-divider" style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '11px', color: '#1e3a8a', padding: '3px 2px' }}>चार्ज</td>
                    <td colSpan="5" style={{ padding: '3px 8px', color: '#1e3a8a', fontWeight: 700, fontSize: '12px' }}>
                      🔧 सर्विस व अतिरिक्त प्रभार (Service & Extra Charges - Added at Bottom)
                    </td>
                  </tr>
                )}

                {/* Service Charges Rows */}
                {serviceItems.map((item, sIdx) => {
                  const amtRupees = item.amountRupees !== undefined ? item.amountRupees : item.rupees;
                  const amtPaise = item.amountPaise !== undefined ? item.amountPaise : item.paise;
                  return (
                    <tr key={`serv-${sIdx}`} className="mdd-service-row" style={{ background: '#fffdf5' }}>
                      <td className="text-center" style={{ fontWeight: 800, color: '#1e3a8a' }}>{regularItems.length + sIdx + 1}</td>
                      <td>
                        <span className="mdd-service-badge" style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '3px', fontSize: '10px', padding: '1px 5px', marginRight: '6px', fontWeight: 800 }}>
                          सर्विस/शुल्क
                        </span>
                        <strong>{item.description || item.desc}</strong>
                      </td>
                      <td className="text-center font-mono" style={{ fontWeight: 700 }}>{item.qty || '1 Job'}</td>
                      <td className="text-right font-mono">
                        {item.rate ? `₹${Number(item.rate).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="text-right font-mono font-bold" style={{ color: '#1e3a8a' }}>
                        {amtRupees > 0 ? Number(amtRupees).toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="text-center font-mono">
                        {amtPaise > 0 ? String(amtPaise).padStart(2, '0') : '00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-right font-bold slip-total-label" style={{ verticalAlign: 'middle', padding: '3px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                      {regularItems.length > 0 && serviceItems.length > 0 ? (
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          <span>📦 सामान कुल: <strong>₹{regularTotal.toLocaleString('en-IN')}</strong></span>
                          <span style={{ color: '#94a3b8', margin: '0 2px' }}>|</span>
                          <span>🔧 सर्विस व अन्य प्रभार: <strong>₹{serviceTotal.toLocaleString('en-IN')}</strong></span>
                        </div>
                      ) : <div />}
                      <span style={{ marginLeft: 'auto' }}>कुल योग (TOTAL):</span>
                    </div>
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
