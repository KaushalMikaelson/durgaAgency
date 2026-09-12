// Universal Animated Modal Wrapper
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from '../../utils/motion.jsx';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = '720px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-content-card"
          style={{ maxWidth }}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {title && (
            <div className="modal-header">
              <h3>{title}</h3>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
