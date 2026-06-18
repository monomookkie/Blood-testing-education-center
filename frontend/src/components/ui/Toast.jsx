import { useEffect } from 'react';
import Icon from './Icon';

export default function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    warn:    'bg-amber-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-lg text-sm font-medium ${styles[type] || styles.success}`}
      style={{ animation: 'slideIn .2s ease', minWidth: 240 }}>
      <Icon name={type === 'success' ? 'check' : type === 'error' ? 'x' : 'alert'} size={15} />
      <span>{msg}</span>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100"><Icon name="x" size={13} /></button>
    </div>
  );
}
