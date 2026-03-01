import { useState } from 'react';
import { useWaste } from '../context/WasteContext';
import { WASTE_REASONS, getCategoryById } from '../data/categories';
import '../styles/log-panel.css';

export default function WasteLog({ onAdd }) {
  const { wasteLog, deleteWaste } = useWaste();
  const [confirmDelete, setConfirmDelete] = useState(null);

  function handleDelete(id) {
    if (confirmDelete === id) {
      deleteWaste(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getReasonLabel(id) {
    return WASTE_REASONS.find(r => r.id === id)?.label || id;
  }

  const totalCostLoss = wasteLog.reduce((sum, e) => sum + (e.costLoss || 0), 0);
  const totalQtyWasted = wasteLog.reduce((sum, e) => sum + (e.qtyWasted || 0), 0);

  return (
    <div className="log-panel">
      <div className="log-panel__toolbar">
        <h2 className="log-panel__title">WASTE LOG</h2>
        <span className="log-panel__count">{wasteLog.length} entries</span>
        {wasteLog.length > 0 && (
          <span className="log-panel__total-loss">Total loss: ${totalCostLoss.toFixed(2)}</span>
        )}
      </div>

      {wasteLog.length === 0 ? (
        <div className="log-panel__empty">
          <div className="log-panel__empty-icon">⚠</div>
          <div className="log-panel__empty-title">NO WASTE LOGGED</div>
          <div className="log-panel__empty-sub">Track expired, damaged, or stolen items here</div>
          <button className="log-panel__empty-btn" onClick={onAdd}>+ LOG WASTE</button>
        </div>
      ) : (
        <div className="log-panel__list">
          {wasteLog.map(entry => (
            <div key={entry.id} className="log-entry log-entry--waste">
              <div className="log-entry__header">
                <div className="log-entry__main">
                  <span className="log-entry__sku">{entry.sku}</span>
                  <span className="log-entry__name">{entry.itemName}</span>
                </div>
                <div className="log-entry__qty log-entry__qty--out">-{entry.qtyWasted}</div>
              </div>
              <div className="log-entry__details">
                <span>{formatDate(entry.date)}</span>
                <span className="log-entry__reason">{getReasonLabel(entry.reason)}</span>
                {entry.costLoss > 0 && (
                  <span className="log-entry__cost log-entry__cost--loss">-${entry.costLoss.toFixed(2)}</span>
                )}
              </div>
              {entry.notes && <div className="log-entry__notes">{entry.notes}</div>}
              <button
                className={`action-btn action-btn--delete action-btn--small ${confirmDelete === entry.id ? 'action-btn--confirm' : ''}`}
                onClick={() => handleDelete(entry.id)}
              >
                {confirmDelete === entry.id ? 'CONFIRM?' : 'DEL'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
