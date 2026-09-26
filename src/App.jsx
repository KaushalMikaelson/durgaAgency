import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { Modals } from './components/Modals.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { initTractorOS } from './app.bundle.js';

class AnalyticsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('AnalyticsPage caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (window.app && window.app.renderAnalyticsHTML) {
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: window.app.renderAnalyticsHTML() }}
            ref={() => {
              if (window.app && window.app.bindAnalyticsEvents) {
                setTimeout(() => window.app.bindAnalyticsEvents(), 0);
              }
            }}
          />
        );
      }
      return (
        <div style={{ padding: '30px', textAlign: 'center', color: '#ef4444' }}>
          Unable to display Analytics. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

let reactAnalyticsRoot = null;

export default function App() {
  useEffect(() => {
    // Expose React Analytics mount bridge for TractorOS
    window.renderReactAnalytics = (container) => {
      if (!container) return;
      try {
        if (reactAnalyticsRoot) {
          try {
            reactAnalyticsRoot.unmount();
          } catch (e) {
            // ignore unmount errors
          }
          reactAnalyticsRoot = null;
        }
        reactAnalyticsRoot = createRoot(container);
        reactAnalyticsRoot.render(
          <AnalyticsErrorBoundary>
            <AnalyticsPage />
          </AnalyticsErrorBoundary>
        );
      } catch (err) {
        console.error('Failed to render React Analytics, falling back to HTML:', err);
        if (window.app && window.app.renderAnalyticsHTML) {
          container.innerHTML = window.app.renderAnalyticsHTML();
          window.app.bindAnalyticsEvents();
        }
      }
    };

    window.unmountReactAnalytics = () => {
      if (reactAnalyticsRoot) {
        try {
          reactAnalyticsRoot.unmount();
        } catch (e) {
          // ignore unmount errors if container already cleaned
        }
        reactAnalyticsRoot = null;
      }
    };

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

