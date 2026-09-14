import React from 'react';

export function Modals() {
  return (
    <>
      {/* Modal 1: New Lead / Customer Entry */}
      <div className="modal-backdrop" id="newLeadModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Capture New Customer / Lead</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="newLeadForm">
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Farmer Full Name *</label>
                  <input type="text" id="nlName" className="form-input" placeholder="e.g. Ramesh Chandra Verma" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" id="nlPhone" className="form-input" placeholder="e.g. 9839123456" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Village Name</label>
                  <input type="text" id="nlVillage" className="form-input" placeholder="e.g. Kalyanpur" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Land Size (Acres)</label>
                  <input type="number" id="nlAcres" className="form-input" placeholder="e.g. 10" min="0" max="500" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Main Crops (comma separated)</label>
                  <input type="text" id="nlCrop" className="form-input" placeholder="e.g. Wheat, Rice, Sugarcane" />
                </div>
                <div className="form-group">
                  <label className="form-label">Soil Type</label>
                  <input type="text" id="nlSoilType" className="form-input" placeholder="e.g. Medium / Black / Sandy Loam" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Tractor Owned</label>
                  <input type="text" id="nlCurrentTractor" className="form-input" placeholder="e.g. Swaraj 744 / None" />
                </div>
                <div className="form-group">
                  <label className="form-label">Interested Tractor Model</label>
                  <select id="nlModelSelect" className="form-select">
                    <option value="">-- Select Tractor Model (Optional) --</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Estimated Budget (₹)</label>
                  <input type="number" id="nlBudget" className="form-input" placeholder="e.g. 800000" step="10000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Finance / Loan Required?</label>
                  <select id="nlFinance" className="form-select" defaultValue="">
                    <option value="">-- Not Specified --</option>
                    <option value="Yes">Yes (SBI / HDFC / KCC)</option>
                    <option value="No">No (Full Cash Payment)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Used Tractor Exchange?</label>
                  <select id="nlExchange" className="form-select" defaultValue="">
                    <option value="">-- Not Specified --</option>
                    <option value="No">No Old Tractor</option>
                    <option value="Yes">Yes (Has old tractor to trade-in)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Purchase Horizon</label>
                  <select id="nlDays" className="form-select" defaultValue="">
                    <option value="">-- Not Specified --</option>
                    <option value="7">Within 7 Days (Urgent)</option>
                    <option value="15">Within 15 Days</option>
                    <option value="30">Within This Month (Harvest)</option>
                    <option value="60">2-3 Months</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Buying Score (0 - 100) <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Self-Managed)</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" id="nlScore" className="form-input" placeholder="Leave empty or set (0-100)" min="0" max="100" />
                    <button type="button" className="quick-action-btn btn-sm btn-outline" id="nlCalcScoreBtn" style={{ whiteSpace: 'nowrap' }} title="Calculate score suggestion from inputs">Suggest Score</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Next Action / Notes</label>
                  <input type="text" id="nlNextAction" className="form-input" placeholder="e.g. Call for tractor demo next week" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Save Lead</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 1B: Quick Buying Score Manager */}
      <div className="modal-backdrop" id="quickScoreModal">
        <div className="modal-box">
          <div className="modal-header">
            <h3>Manage Lead Buying Score</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="quickScoreForm">
            <input type="hidden" id="qsLeadId" />
            <div className="modal-body">
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }} id="qsLeadName">Farmer Name</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }} id="qsLeadInfo">Village & Contact</div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Buying Score (0 to 100)</label>
                  <span id="qsScoreBadge" className="badge badge-warm">WARM (60/100)</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="range" id="qsSlider" min="0" max="100" defaultValue="60" style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  <input type="number" id="qsScoreInput" min="0" max="100" className="form-input" style={{ width: '70px', textAlign: 'center', fontWeight: 800, fontSize: '15px' }} placeholder="-" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.setQuickScore(30)}>Cold (30)</button>
                <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.setQuickScore(60)}>Warm (60)</button>
                <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.setQuickScore(85)}>Hot (85)</button>
                <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.setQuickScore('')}>Clear (No Score)</button>
                <button type="button" className="quick-action-btn btn-xs btn-outline" id="qsSuggestBtn" style={{ color: 'var(--primary)' }}>Suggest from Data</button>
              </div>

              <div className="form-group">
                <label className="form-label">Next Action / Follow-up Note</label>
                <input type="text" id="qsNextAction" className="form-input" placeholder="e.g. Call tomorrow for loan approval" />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Save Score & Action</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 1C: Full Edit Lead */}
      <div className="modal-backdrop" id="editLeadModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Edit Customer / Lead Details</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="editLeadForm">
            <input type="hidden" id="elLeadId" />
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Farmer Full Name *</label>
                  <input type="text" id="elName" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" id="elPhone" className="form-input" placeholder="e.g. 9839123456" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Village Name</label>
                  <input type="text" id="elVillage" className="form-input" placeholder="e.g. Kalyanpur" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Land Size (Acres)</label>
                  <input type="number" id="elAcres" className="form-input" placeholder="e.g. 10" min="0" max="500" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Main Crops (comma separated)</label>
                  <input type="text" id="elCrop" className="form-input" placeholder="e.g. Wheat, Rice, Sugarcane" />
                </div>
                <div className="form-group">
                  <label className="form-label">Soil Type</label>
                  <input type="text" id="elSoilType" className="form-input" placeholder="e.g. Medium / Black / Sandy Loam" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Tractor Owned</label>
                  <input type="text" id="elCurrentTractor" className="form-input" placeholder="e.g. Swaraj 744 / None" />
                </div>
                <div className="form-group">
                  <label className="form-label">Interested Tractor Model</label>
                  <select id="elModelSelect" className="form-select">
                    <option value="">-- Select Tractor Model (Optional) --</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Estimated Budget (₹)</label>
                  <input type="number" id="elBudget" className="form-input" placeholder="e.g. 800000" step="10000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Stage</label>
                  <select id="elStage" className="form-select">
                    <option value="New Enquiry">New Enquiry</option>
                    <option value="Needs Analyzed">Needs Analyzed</option>
                    <option value="Demo Scheduled">Demo Scheduled</option>
                    <option value="Demo Completed">Demo Completed</option>
                    <option value="Price / Estimate Sent">Price / Estimate Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Finance / Loan Required?</label>
                  <select id="elFinance" className="form-select">
                    <option value="">-- Not Specified --</option>
                    <option value="Yes">Yes (SBI / HDFC / KCC)</option>
                    <option value="No">No (Full Cash Payment)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Used Tractor Exchange?</label>
                  <select id="elExchange" className="form-select">
                    <option value="">-- Not Specified --</option>
                    <option value="No">No Old Tractor</option>
                    <option value="Yes">Yes (Has old tractor to trade-in)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Buying Score (0 - 100) <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Self-Managed)</span></label>
                  <input type="number" id="elScore" className="form-input" placeholder="Leave empty or set 0-100" min="0" max="100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Action / Notes</label>
                  <input type="text" id="elNextAction" className="form-input" placeholder="e.g. Follow up on price negotiation" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Update Lead</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 1D: Edit Tractor Specifications & Pricing */}
      <div className="modal-backdrop" id="editTractorModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Edit Tractor Specifications & Pricing</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="editTractorForm">
            <input type="hidden" id="etTractorId" />
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" id="etBrand" className="form-input" placeholder="e.g. VST Zetor" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Model Name</label>
                  <input type="text" id="etModel" className="form-input" placeholder="e.g. 5011 4WD" required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Engine Horsepower (HP)</label>
                  <input type="number" id="etHp" className="form-input" placeholder="e.g. 50" min="20" max="120" required />
                </div>
                <div className="form-group">
                  <label className="form-label">PTO HP</label>
                  <input type="number" id="etPtoHp" className="form-input" placeholder="e.g. 44" min="15" max="110" step="0.1" required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Drive Type</label>
                  <select id="etDrive" className="form-select">
                    <option value="2WD">2WD</option>
                    <option value="4WD">4WD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lift Capacity (kg)</label>
                  <input type="number" id="etLift" className="form-input" placeholder="e.g. 1800" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Showroom Retail Price (₹)</label>
                  <input type="number" id="etPrice" className="form-input" placeholder="e.g. 820000" step="1000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Dealer OEM Purchase Cost (₹)</label>
                  <input type="number" id="etCost" className="form-input" placeholder="e.g. 740000" step="1000" required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Physical Stock Count</label>
                  <input type="number" id="etStock" className="form-input" placeholder="e.g. 0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty Details</label>
                  <input type="text" id="etWarranty" className="form-input" placeholder="e.g. 6 Years / 6000 Hours Warranty" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Save Tractor Changes</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 2: Fast Expense Entry */}
      <div className="modal-backdrop" id="fastExpenseModal">
        <div className="modal-box">
          <div className="modal-header">
            <h3>Fast Expense Entry</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="fastExpenseForm">
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Expense Amount (₹)</label>
                  <input type="number" id="feAmount" className="form-input" placeholder="e.g. 4500" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>&lt; ₹5,000 auto-approved; &ge; ₹5,000 requires manager approval</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select id="feCategory" className="form-select">
                    <option value="Fuel">Fuel / Diesel (Van & Demo)</option>
                    <option value="Transport">Inward Freight / Transport</option>
                    <option value="Repairs & PDI">Repairs, Teflon & PDI</option>
                    <option value="Salaries">Staff Salaries / Advance</option>
                    <option value="Showroom Rent">Showroom & Yard Rent</option>
                    <option value="Advertising">Banners & Social Ads</option>
                    <option value="Electricity">Electricity & Utilities</option>
                    <option value="Customer & Tea/Food">Customer Tea / Hospitality</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select id="feMode" className="form-select">
                    <option value="Cash">Cash (Showroom Drawer)</option>
                    <option value="Bank Transfer">Bank Transfer (SBI)</option>
                    <option value="UPI">UPI / PhonePe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Paid To (Vendor / Person)</label>
                  <input type="text" id="fePaidTo" className="form-input" placeholder="e.g. Kisan Petrol Pump" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Connect to Specific Tractor Chassis (Optional Unit Cost)</label>
                <input type="text" id="feChassisTag" className="form-input" placeholder="e.g. SW855-2026-091 (Reduces this tractor's profit margin)" />
              </div>

              <div className="form-group">
                <label className="form-label">Purpose / Description</label>
                <input type="text" id="feNotes" className="form-input" placeholder="e.g. 50L diesel for customer delivery van" />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-gold">Record Expense</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 3: WhatsApp Follow-Up Sequences */}
      <div className="modal-backdrop" id="waSequenceModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>WhatsApp Follow-Up Automation</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <div className="modal-body" id="waSequenceModalBody">
          </div>
          <div className="modal-footer">
            <button type="button" className="quick-action-btn btn-outline modal-close-btn">Close</button>
          </div>
        </div>
      </div>

      {/* Modal 4: Tractor Unit Economics & Landed Cost */}
      <div className="modal-backdrop" id="unitMarginModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Tractor Unit Profitability & Margin Leakage</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <div className="modal-body" id="unitMarginModalBody">
          </div>
          <div className="modal-footer">
            <button type="button" className="quick-action-btn btn-outline modal-close-btn">Close</button>
          </div>
        </div>
      </div>

      {/* Modal 5: Create New Bill (Maa Durga Diesel) */}
      <div className="modal-backdrop" id="newBillModal">
        <div className="modal-box large" style={{ maxWidth: '860px' }}>
          <div className="modal-header">
            <div>
              <h3 style={{ margin: 0 }}>माँ दुर्गा डीजल - नया बिल / पर्ची बनाएं (New Bill)</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Maa Durga Diesel Estimate & Cash Memo • डीलर बिल बुक रिकॉर्ड
              </div>
            </div>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="newBillForm">
            <div className="modal-body">
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">बिल नंबर (Bill No.) *</label>
                  <input type="text" id="nbBillNo" className="form-input" required />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} id="nbBillNoHint">Auto-incremented</span>
                </div>
                <div className="form-group">
                  <label className="form-label">दिनांक (Date) *</label>
                  <input type="date" id="nbDate" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">मोबाइल नंबर (Mobile)</label>
                  <input type="tel" id="nbPhone" className="form-input" placeholder="9839123456" />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">मेसर्स / ग्राहक का नाम (Customer Name) *</label>
                  <input type="text" id="nbCustomer" className="form-input" placeholder="e.g. Ramesh Chandra Verma" required />
                </div>
                <div className="form-group">
                  <label className="form-label">पता / गाँव (Address / Village)</label>
                  <input type="text" id="nbAddress" className="form-input" placeholder="e.g. Kalyanpur, Gorakhpur" />
                </div>
                <div className="form-group">
                  <label className="form-label">वाहन / ट्रैक्टर नं० (Vehicle / Tractor No.)</label>
                  <input type="text" id="nbVehicle" className="form-input" placeholder="e.g. UP-53-AZ-1234" />
                </div>
              </div>

              {/* Items Header & Add Row */}
              <div style={{ margin: '14px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 800 }}>विवरण व मदें (Items & Particulars):</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.addBillPresetItem('डीजल (High Speed Diesel)', 40, 'Ltr', 94)}>+ 40L Diesel</button>
                  <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.addBillPresetItem('इंजन ऑयल Mobil Delvac 1', 1, 'Can', 2450)}>+ Mobil Delvac</button>
                  <button type="button" className="quick-action-btn btn-xs btn-outline" onClick={() => window.app?.addBillPresetItem('डीजल फिल्टर किट (Bosch)', 2, 'Pcs', 340)}>+ Diesel Filter</button>
                  <button type="button" className="quick-action-btn btn-xs btn-primary" onClick={() => window.app?.addBillItemRow()}>+ Add Row</button>
                </div>
              </div>

              {/* Items Table */}
              <div className="table-responsive" style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table className="data-table" style={{ margin: 0, fontSize: '12.5px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>क्र० (#)</th>
                      <th>विवरण (Item Description)</th>
                      <th style={{ width: '85px', textAlign: 'center' }}>मात्रा (Qty)</th>
                      <th style={{ width: '85px' }}>इकाई (Unit)</th>
                      <th style={{ width: '95px', textAlign: 'right' }}>दर (Rate ₹)</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>रू० (Rupees)</th>
                      <th style={{ width: '55px', textAlign: 'center' }}>पै०</th>
                      <th style={{ width: '36px' }}></th>
                    </tr>
                  </thead>
                  <tbody id="nbItemsBody">
                    {/* Dynamically populated by JS */}
                  </tbody>
                </table>
              </div>

              {/* Summary & Words */}
              <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>राशि शब्दों में (Amount in Words):</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }} id="nbWordsPreview">Zero Rupees Only</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>कुल राशि (Total Amount):</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace, sans-serif' }}>
                    <span id="nbTotalRupeesDisplay">₹0</span><span id="nbTotalPaiseDisplay" style={{ fontSize: '15px', color: 'var(--text-muted)' }}>.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="button" className="quick-action-btn btn-outline" id="nbPreviewOnlyBtn" style={{ borderColor: '#2563eb', color: '#2563eb' }}>
                🖨️ Preview on Bill Sheet
              </button>
              <button type="submit" className="quick-action-btn btn-primary" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                💾 Save & Print Bill
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modal 6: Printable Bill Sheet & Cash Memo Preview (Maa Durga Diesel) */}
      <div className="modal-backdrop" id="billPreviewModal">
        <div className="modal-box large" style={{ maxWidth: '900px' }}>
          <div className="modal-header no-print">
            <div>
              <h3 style={{ margin: 0 }}>माँ दुर्गा डीजल पर्ची - बिल प्रीव्यू (Bill Preview)</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Maa Durga Diesel Estimate & Cash Memo
              </div>
            </div>
            <button className="modal-close-btn">&times;</button>
          </div>
          <div className="modal-body" id="billPreviewBody" style={{ padding: '4px' }}>
          </div>
          <div className="modal-footer no-print" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="quick-action-btn btn-outline modal-close-btn">Close</button>
            <button type="button" className="quick-action-btn btn-primary" onClick={() => {
              document.body.classList.add('is-printing-bill', 'bill-modal-active', 'modal-open');
              window.print();
            }} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
              🖨️ Print Bill (प्रिंट करें)
            </button>
          </div>
        </div>
      </div>      {/* Modal 7: Schedule Field Demo */}
      <div className="modal-backdrop" id="newDemoModal">
        <div className="modal-box">
          <div className="modal-header">
            <h3>Schedule Tractor Field Demo</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="newDemoForm">
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Farmer Name</label>
                  <input type="text" id="ndLeadName" className="form-input" placeholder="e.g. Ramesh Verma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Village</label>
                  <input type="text" id="ndVillage" className="form-input" placeholder="e.g. Kalyanpur" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tractor Model</label>
                  <input type="text" id="ndTractorModel" className="form-input" placeholder="e.g. VST Zetor 5011 4WD" />
                </div>
                <div className="form-group">
                  <label className="form-label">Implement for Demo</label>
                  <input type="text" id="ndImplement" className="form-input" placeholder="e.g. Rotavator (6 ft)" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Demo Date</label>
                  <input type="date" id="ndDate" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Salesman / Demo Driver</label>
                  <input type="text" id="ndSalesman" className="form-input" placeholder="e.g. Amit Kumar" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Schedule Demo</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 8: Vehicle Delivery Gate Pass & Challan */}
      <div className="modal-backdrop" id="gatePassModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Vehicle Delivery Challan & Gate Pass Generator</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="gatePassForm">
            <div className="modal-body" id="gatePassModalBody">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input type="text" id="gpCustomer" className="form-input" placeholder="Enter customer full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" id="gpPhone" className="form-input" placeholder="Enter 10-digit mobile number" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Village & Address</label>
                  <input type="text" id="gpVillage" className="form-input" placeholder="e.g. Kalyanpur, Gorakhpur" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tractor Model</label>
                  <select id="gpTractorSelect" className="form-select">
                    <option value="VST Zetor 4211 (42 HP 2WD)">VST Zetor 4211 (42 HP 2WD)</option>
                    <option value="VST Zetor 4211 4WD (42 HP 4x4)">VST Zetor 4211 4WD (42 HP 4x4)</option>
                    <option value="VST Zetor 4511 (47 HP 2WD)">VST Zetor 4511 (47 HP 2WD)</option>
                    <option value="VST Zetor 4511 4WD (47 HP 4x4)">VST Zetor 4511 4WD (47 HP 4x4)</option>
                    <option value="VST Zetor 5011 (50 HP 2WD)">VST Zetor 5011 (50 HP 2WD)</option>
                    <option value="VST Zetor 5011 4WD (50 HP 4x4)">VST Zetor 5011 4WD (50 HP 4x4)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Chassis / Serial Number</label>
                  <input type="text" id="gpChassis" className="form-input" placeholder="e.g. VZ5011-2026-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Engine Number</label>
                  <input type="text" id="gpEngine" className="form-input" placeholder="e.g. ENG-882194" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Battery Brand & Serial No</label>
                  <input type="text" id="gpBattery" className="form-input" placeholder="e.g. Exide Heavy Duty 12V 88Ah" />
                </div>
                <div className="form-group">
                  <label className="form-label">Financed By (Bank)</label>
                  <input type="text" id="gpBank" className="form-input" placeholder="e.g. State Bank of India or Cash" />
                </div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '12.5px', fontWeight: 700 }}>Included Delivery Accessories & Tools:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
                <label><input type="checkbox" defaultChecked /> Ignition Key Set (2 Keys)</label>
                <label><input type="checkbox" defaultChecked /> Owner's Service Manual</label>
                <label><input type="checkbox" defaultChecked /> Showroom Tool Kit</label>
                <label><input type="checkbox" defaultChecked /> Heavy Tow Hitch Pin</label>
                <label><input type="checkbox" defaultChecked /> Hydraulic Top Link</label>
                <label><input type="checkbox" defaultChecked /> 10L Transit Fuel Filled</label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Generate & Print Gate Pass</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 9: Backup & Data Management */}
      <div className="modal-backdrop" id="backupModal">
        <div className="modal-box">
          <div className="modal-header">
            <h3>Showroom Database & Backup</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Export your complete dealership records (leads, bills, expenses, inventory, demos) to an offline backup JSON file, or restore from a previous save.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="quick-action-btn btn-primary" id="downloadBackupBtn" style={{ justifyContent: 'center', padding: '12px' }}>
                📥 Download Complete Backup (.json)
              </button>
              <button className="quick-action-btn btn-outline" id="resetDataBtn" style={{ justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                ⚠️ Reset Database to Clean Defaults
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="quick-action-btn btn-outline modal-close-btn">Close</button>
          </div>
        </div>
      </div>

      {/* Modal 10: Kisan Credit Card & Bank Loan Document Checklist */}
      <div className="modal-backdrop" id="loanDocsModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Kisan Tractor Loan & Bank File Checklist</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <div className="modal-body" id="loanDocsModalBody">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Farmer Customer</label>
                <select id="ldFarmerSelect" className="form-select">
                  <option value="">-- Select Farmer Lead --</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Financing Bank Branch</label>
                <select id="ldBankSelect" className="form-select">
                  <option value="State Bank of India (Kisan Mandi Branch)">State Bank of India (Kisan Mandi Branch)</option>
                  <option value="Punjab National Bank (Sahjanwa Branch)">Punjab National Bank (Sahjanwa)</option>
                  <option value="UP Grameen Bank (Bansgaon Branch)">UP Grameen Bank (Bansgaon)</option>
                  <option value="HDFC Agro Finance">HDFC Agro Finance Desk</option>
                </select>
              </div>
            </div>

            <div style={{ margin: '16px 0 8px 0', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Mandatory Document Checklist for Loan Sanction:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} id="ldChecklistContainer">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" defaultChecked />
                <span><strong>खसरा एवं खतौनी (7/12 Land Records)</strong> — Certified by Tehsil within 3 months</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" defaultChecked />
                <span><strong>Aadhaar Card & Voter ID Copy</strong> — Self-attested with mobile link verified</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" defaultChecked />
                <span><strong>PAN Card Copy</strong> — Verified for CIBIL score</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" defaultChecked />
                <span><strong>6 Months Savings / KCC Bank Statement</strong> — Showing agricultural harvest credits</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" />
                <span><strong>Bank No Due Certificate (NOC)</strong> — From local cooperative / regional rural bank</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" defaultChecked />
                <span><strong>Official Showroom Bill & Estimate (Maa Durga Diesel)</strong> — Including GST & chassis specification</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <input type="checkbox" className="ld-check" defaultChecked />
                <span><strong>Margin Money Advance Receipt</strong> — Showing token down payment paid to showroom</span>
              </label>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-dark)' }}>File Status: Ready for Field Inspection by Agri Officer</div>
              <p style={{ fontSize: '11.5px', color: 'var(--primary)', marginTop: '2px' }}>
                6 of 7 documents verified. Bank field inspection scheduled within 48 hours for final disbursement.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="quick-action-btn btn-outline modal-close-btn">Close</button>
            <button type="button" className="quick-action-btn btn-whatsapp" id="sendLoanChecklistWaBtn">
              Send Missing Docs List on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Modal 11: Add Tractor Model & Stock Entry */}
      <div className="modal-backdrop" id="addTractorModal">
        <div className="modal-box large">
          <div className="modal-header">
            <h3>Add Tractor Model / Inventory Stock</h3>
            <button className="modal-close-btn">&times;</button>
          </div>
          <form id="addTractorForm">
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" id="ntBrand" className="form-input" placeholder="e.g. VST Zetor" />
                </div>
                <div className="form-group">
                  <label className="form-label">Model Name</label>
                  <input type="text" id="ntModel" className="form-input" placeholder="e.g. 5011 4WD, 4511 Pro" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Engine Horsepower (HP)</label>
                  <input type="number" id="ntHp" className="form-input" placeholder="e.g. 50" min="20" max="120" />
                </div>
                <div className="form-group">
                  <label className="form-label">PTO HP</label>
                  <input type="number" id="ntPtoHp" className="form-input" placeholder="e.g. 44" min="15" max="110" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Drive Type</label>
                  <select id="ntDrive" className="form-select">
                    <option value="2WD">2WD</option>
                    <option value="4WD">4WD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lift Capacity (kg)</label>
                  <input type="number" id="ntLift" className="form-input" placeholder="e.g. 1800" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Showroom Retail Price (₹)</label>
                  <input type="number" id="ntPrice" className="form-input" placeholder="e.g. 820000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Dealer Purchase Cost (₹)</label>
                  <input type="number" id="ntCost" className="form-input" placeholder="e.g. 740000" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Initial Physical Stock Count</label>
                  <input type="number" id="ntStock" className="form-input" placeholder="e.g. 1" min="0" defaultValue="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Chassis Serial Number (Optional)</label>
                  <input type="text" id="ntChassis" className="form-input" placeholder="e.g. VZ5011-2026-001" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="quick-action-btn btn-outline modal-close-btn">Cancel</button>
              <button type="submit" className="quick-action-btn btn-primary">Save to Showroom Inventory</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
