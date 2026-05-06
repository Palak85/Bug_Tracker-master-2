import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * ConfirmModal — replaces native browser confirm() dialogs.
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState(null);
 *
 *   // trigger:
 *   setConfirmState({
 *     message: 'Are you sure?',
 *     onConfirm: () => doSomething(),
 *   });
 *
 *   // render:
 *   <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
 *
 * Props:
 *   state   — null (hidden) or { message, onConfirm, title?, variant? }
 *             variant: 'danger' (default) | 'warning'
 *   onClose — called when the user cancels or after confirming
 */
export default function ConfirmModal({ state, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!state) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, onClose]);

  if (!state) return null;

  const {
    title    = 'Are you sure?',
    message  = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    variant  = 'danger',
    onConfirm,
  } = state;

  const isDanger = variant === 'danger';

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-800/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-[24px] shadow-[0_25px_60px_rgba(0,0,0,0.2)] w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f3f5f9] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
          isDanger ? 'bg-rose-50' : 'bg-amber-50'
        }`}>
          {isDanger
            ? <Trash2 className="w-7 h-7 text-rose-500" />
            : <AlertTriangle className="w-7 h-7 text-amber-500" />
          }
        </div>

        {/* Text */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-2">{title}</h2>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-gray-500 bg-[#f3f5f9] hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${
              isDanger
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
