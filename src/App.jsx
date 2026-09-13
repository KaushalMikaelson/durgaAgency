import React, { useEffect } from 'react';
import './styles.css';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { Modals } from './components/Modals.jsx';
import { initTractorOS } from './app.bundle.js';

export default function App() {
  useEffect(() => {
    initTractorOS();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-layout">
        <Topbar />
        <div className="page-content" id="mainContentArea">
          {/* Dynamically managed by TractorOS engine */}
        </div>
      </main>
      <Modals />
      <div id="toastContainer" className="toast-container" aria-live="polite"></div>
    </div>
  );
}
