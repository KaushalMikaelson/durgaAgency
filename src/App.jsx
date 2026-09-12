// Main Dealership OS Container with Framer Motion & Responsive Tab Routing
import React, { useState } from 'react';
import { DealershipProvider, useDealership } from './context/DealershipContext.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { TopBar } from './components/layout/TopBar.jsx';
import { Modal } from './components/common/Modal.jsx';
import { ToastContainer } from './components/common/Toast.jsx';

import { DashboardPage } from './pages/DashboardPage.jsx';
import { LeadsPage } from './pages/LeadsPage.jsx';
import { BillingPage } from './pages/BillingPage.jsx';
import { InventoryPage } from './pages/InventoryPage.jsx';
import { RecommendationPage } from './pages/RecommendationPage.jsx';
import { ExpensesPage } from './pages/ExpensesPage.jsx';
import { CashFlowPage } from './pages/CashFlowPage.jsx';
import { DemosPage } from './pages/DemosPage.jsx';
import { VillageMapPage } from './pages/VillageMapPage.jsx';
import { AiAdvisorPage } from './pages/AiAdvisorPage.jsx';

import { MaaDurgaBillSheet } from './components/billing/MaaDurgaBillSheet.jsx';
import { BillPrintModal } from './components/billing/BillPrintModal.jsx';
import { LeadModal } from './components/leads/LeadModal.jsx';
import { TractorModal } from './components/inventory/TractorModal.jsx';
import { UnitEconomicsModal } from './components/inventory/UnitEconomicsModal.jsx';
import { ExpenseModal } from './components/expenses/ExpenseModal.jsx';
import { ExchangeModal } from './components/exchange/ExchangeModal.jsx';

import { motion, AnimatePresence } from './utils/motion.jsx';
import './styles/index.css';

function MainLayout() {
  const { activeTab, activeModal, openModal, closeModal } = useDealership();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage key="dashboard" />;
      case 'leads': return <LeadsPage key="leads" />;
      case 'billing': return <BillingPage key="billing" />;
      case 'inventory': return <InventoryPage key="inventory" />;
      case 'recommend': return <RecommendationPage key="recommend" />;
      case 'expenses': return <ExpensesPage key="expenses" />;
      case 'cashflow': return <CashFlowPage key="cashflow" />;
      case 'demos': return <DemosPage key="demos" />;
      case 'villageMap': return <VillageMapPage key="villageMap" />;
      case 'aiAdvisor': return <AiAdvisorPage key="aiAdvisor" />;
      default: return <DashboardPage key="default" />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      
      <div className="main-content-area">
        <TopBar onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        
        <main className="page-view-host">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="page-motion-wrapper"
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer />

      {/* Global Modals Host */}
      {activeModal && (
        <>
          {activeModal.type === 'billSheet' && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title="माँ दुर्गा डीजल - बिल बुक (Estimate / Cash Memo)"
              maxWidth="880px"
            >
              <MaaDurgaBillSheet
                initialData={activeModal.data}
                onClose={closeModal}
                onPrintPreview={(b) => openModal('billPrint', b)}
              />
            </Modal>
          )}

          {activeModal.type === 'billPrint' && (
            <BillPrintModal
              bill={activeModal.data}
              onClose={closeModal}
            />
          )}

          {activeModal.type === 'lead' && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title={activeModal.data?.id ? "Edit Farmer Lead" : "Record New Farmer Enquiry"}
              maxWidth="680px"
            >
              <LeadModal
                initialData={activeModal.data}
                onClose={closeModal}
              />
            </Modal>
          )}

          {activeModal.type === 'tractor' && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title="Manage Physical Stock & Chassis"
              maxWidth="560px"
            >
              <TractorModal
                tractor={activeModal.data}
                onClose={closeModal}
              />
            </Modal>
          )}

          {activeModal.type === 'unitEconomics' && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title="Landed Unit Economics & Net Dealer Margins"
              maxWidth="640px"
            >
              <UnitEconomicsModal
                tractor={activeModal.data}
                onClose={closeModal}
              />
            </Modal>
          )}

          {activeModal.type === 'expense' && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title="Log Showroom Operational Expense"
              maxWidth="580px"
            >
              <ExpenseModal onClose={closeModal} />
            </Modal>
          )}

          {activeModal.type === 'exchange' && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title="Used Tractor Exchange Valuation"
              maxWidth="760px"
            >
              <ExchangeModal onClose={closeModal} />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DealershipProvider>
      <MainLayout />
    </DealershipProvider>
  );
}
