// Animated Toast Notification Stack
import React from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';
import { motion, AnimatePresence } from '../../utils/motion.jsx';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useDealership();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let cls = 'toast-success';
          if (toast.type === 'warning') {
            Icon = AlertTriangle;
            cls = 'toast-warning';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            cls = 'toast-error';
          } else if (toast.type === 'info') {
            Icon = Info;
            cls = 'toast-info';
          }

          return (
            <motion.div
              key={toast.id}
              className={`toast-item ${cls}`}
              initial={{ opacity: 0, x: 40, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="toast-icon">
                <Icon size={20} />
              </div>
              <div className="toast-content">
                {toast.title && <div className="toast-title">{toast.title}</div>}
                <div className="toast-msg">{toast.message}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
