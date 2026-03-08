import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, Zap, X } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '../../stores/toast-store';

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-success" />,
  error: <AlertCircle size={18} className="text-error" />,
  info: <Info size={18} className="text-secondary" />,
  action: <Zap size={18} className="text-warning" />,
};

const borderColors: Record<string, string> = {
  success: 'border-l-success',
  error: 'border-l-error',
  info: 'border-l-secondary',
  action: 'border-l-warning',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastType; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [onClose, toast.duration]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      className={`bg-surface border border-border ${borderColors[toast.type]} border-l-4 rounded-xl p-4 shadow-2xl shadow-black/30 flex items-start gap-3`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="text-xs text-textSecondary mt-1">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="shrink-0 text-textSecondary hover:text-text transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
};
