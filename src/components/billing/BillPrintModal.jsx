// Print Modal and Layout for Maa Durga Diesel Bill Slip
import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { numberToIndianWords } from '../../utils/numberToWords.js';
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

  const words = bill.amountWords || numberToIndianWords(bill.totalRupees || 0);

  const rawItems = bill.items || [];
  const regularItems = rawItems.filter(it => !isServiceItem(it));
  const serviceItems = rawItems.filter(it => isServiceItem(it));
  const hasMixedTypes = regularItems.length > 0 && serviceItems.length > 0 && rawItems.length > 1;

  const regularTotal = regularItems.reduce((sum, it) => sum + (Number(it.amountRupees || it.rupees) || 0), 0);
  const serviceTotal = serviceItems.reduce((sum, it) => sum + (Number(it.amountRupees || it.rupees) || 0), 0);
  const discount = Number(bill.discount || 0);

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
          <div className="slip-ganesh">ESTIMATE / CASH MEMO</div>
          <div className="slip-tag-estimate">GENUINE SPARES & TRACTOR SERVICE</div>

          <div className="slip-main-title">MAA DURGA DIESEL</div>
          <div className="slip-subtitle">Dealers in Diesel Pump, Nozzles & Tractor Spare Parts</div>
          <div className="slip-address">Barhalganj Road, Dohrighat, Mau</div>

          <div className="slip-meta-grid">
            <div className="meta-row">
              <div className="meta-field flex-1">
                <span className="meta-lbl">Bill No.:</span>
                <span className="dotted-val bold-red">{bill.billNumber}</span>
              </div>
              <div className="meta-field flex-1 text-right">
                <span className="meta-lbl">Date:</span>
                <span className="dotted-val bold-red">{formatToDMY(bill.date)}</span>
              </div>
            </div>

            <div className="meta-row">
              <div className="meta-field flex-1">
                <span className="meta-lbl">M/s:</span>
                <span className="dotted-val bold-red">{bill.customerName}</span>
              </div>
            </div>

            <div className="meta-row">
              <div className="meta-field flex-2">
                <span className="meta-lbl">Address:</span>
                <span className="dotted-val">{bill.address || '-'}</span>
              </div>
              <div className="meta-field flex-1">
                <span className="meta-lbl">Vehicle No.:</span>
                <span className="dotted-val">{bill.vehicle || '-'}</span>
              </div>
              <div className="meta-field flex-1">
                <span className="meta-lbl">Mobile No.:</span>
                <span className="dotted-val">{bill.phone || '-'}</span>
              </div>
            </div>
          </div>

          <div className="slip-table-container">
            <table className="slip-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>Sl.</th>
                  <th>Particulars / Item Description</th>
                  <th style={{ width: '90px' }}>Qty.</th>
                  <th style={{ width: '100px' }}>Rate</th>
                  <th style={{ width: '110px' }}>Rs.</th>
                  <th style={{ width: '45px' }}>P.</th>
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

                {/* Service Charges Section Divider (Only when mixed types exist) */}
                {hasMixedTypes && (
                  <tr className="slip-service-divider" style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '11px', color: '#1e3a8a', padding: '3px 2px' }}>CHARGE</td>
                    <td colSpan="5" style={{ padding: '3px 8px', color: '#1e3a8a', fontWeight: 700, fontSize: '12px' }}>
                      Service & Extra Charges (Added at Bottom)
                    </td>
                  </tr>
                )}

                {/* Service Charges Rows */}
                {serviceItems.map((item, sIdx) => {
                  const amtRupees = item.amountRupees !== undefined ? item.amountRupees : item.rupees;
                  const amtPaise = item.amountPaise !== undefined ? item.amountPaise : item.paise;
                  const serialNo = hasMixedTypes ? (regularItems.length + sIdx + 1) : (sIdx + 1);
                  return (
                    <tr key={`serv-${sIdx}`} className="mdd-service-row" style={{ background: '#fffdf5' }}>
                      <td className="text-center" style={{ fontWeight: 800, color: '#1e3a8a' }}>{serialNo}</td>
                      <td>
                        <span className="mdd-service-badge" style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '3px', fontSize: '10px', padding: '1px 5px', marginRight: '6px', fontWeight: 800 }}>
                          SERVICE
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
                      <div className="mdd-subtotal-breakdown-inline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                        {(serviceTotal > 0 || discount > 0) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <span>Subtotal:</span>
                            <strong style={{ color: '#0f172a', fontFamily: 'monospace, sans-serif' }}>₹{regularTotal.toLocaleString('en-IN')}</strong>
                          </span>
                        )}
                        {serviceTotal > 0 && (
                          <>
                            <span style={{ color: '#94a3b8', margin: '0 1px' }}>|</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#1e3a8a' }}>
                              <span>Service:</span>
                              <strong style={{ color: '#1e3a8a', fontFamily: 'monospace, sans-serif' }}>+ ₹{serviceTotal.toLocaleString('en-IN')}</strong>
                            </span>
                          </>
                        )}
                        {discount > 0 && (
                          <>
                            <span style={{ color: '#94a3b8', margin: '0 1px' }}>|</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#dc2626' }}>
                              <span>Discount:</span>
                              <strong style={{ color: '#dc2626', fontFamily: 'monospace, sans-serif' }}>- ₹{discount.toLocaleString('en-IN')}</strong>
                            </span>
                          </>
                        )}
                      </div>
                      <span style={{ marginLeft: 'auto' }}>{(serviceTotal > 0 || discount > 0) ? 'TOTAL PAYABLE:' : 'TOTAL:'}</span>
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
              <span className="words-lbl">Rs. in words:</span>
              <span className="words-val">{words}</span>
            </div>

            <div className="slip-signs-row" style={{ justifyContent: 'flex-end' }}>
              <div className="sign-col shop-sign" style={{ textAlign: 'center' }}>
                <div style={{ height: '40px' }}></div>
                <div className="sign-line" style={{ width: '180px', margin: '0 auto 4px' }}></div>
                <span>Authorized Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
