import { useState } from 'react';
import { useReceiving } from '../context/ReceivingContext';
import { useLocations } from '../context/LocationContext';
import '../styles/log-panel.css';

export default function ReceivingLog({ onAdd }) {
  const { receivingLog, deleteReceiving } = useReceiving();
  const { getLocationName } = useLocations();
  const [confirmDelete, setConfirmDelete] = useState(null);

  function handleDelete(id) {
    if (confirmDelete === id) {
      deleteReceiving(id);
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

  function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="log-panel">
      <div className="log-panel__toolbar">
        <h2 className="log-panel__title">RECEIVING LOG</h2>
        <span className="log-panel__count">{receivingLog.length} entries</span>
      </div>

      {receivingLog.length === 0 ? (
        <div className="log-panel__empty">
          <div className="log-panel__empty-icon">↓</div>
          <div className="log-panel__empty-title">NO STOCK RECEIVED YET</div>
          <div className="log-panel__empty-sub">Log incoming shipments to track receiving history</div>
          <button className="log-panel__empty-btn" onClick={onAdd}>+ RECEIVE STOCK</button>
        </div>
      ) : (
        <div className="log-panel__list">
          {receivingLog.map(entry => (
            <div key={entry.id} className="log-entry">
              <div className="log-entry__header">
                <div className="log-entry__main">
                  <span className="log-entry__sku">{entry.sku}</span>
                  <span className="log-entry__name">{entry.itemName}</span>
                </div>
                <div className="log-entry__qty log-entry__qty--in">+{entry.qtyReceived}</div>
              </div>
              <div className="log-entry__details">
                <span>{formatDate(entry.date)} {formatTime(entry.date)}</span>
                {entry.supplier && <span>from {entry.supplier}</span>}
                {entry.location && <span>→ {getLocationName(entry.location)}</span>}
                {entry.totalCost > 0 && <span className="log-entry__cost">${entry.totalCost.toFixed(2)}</span>}
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
