import { useState } from 'react';
import { useVendors } from '../context/VendorContext';
import { useInventory } from '../context/InventoryContext';
import { getCategoryById } from '../data/categories';
import '../styles/vendors.css';

export default function VendorsPanel({ onEdit, onAdd }) {
  const { vendors, deleteVendor } = useVendors();
  const { inventory } = useInventory();
  const [confirmDelete, setConfirmDelete] = useState(null);

  function handleDelete(id) {
    if (confirmDelete === id) {
      deleteVendor(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  // Count items per vendor
  function getItemCount(vendorName) {
    return inventory.filter(i =>
      i.supplier && i.supplier.toLowerCase() === vendorName.toLowerCase()
    ).length;
  }

  return (
    <div className="vendors-panel">
      <div className="vendors-panel__toolbar">
        <h2 className="vendors-panel__title">VENDORS</h2>
        <span className="vendors-panel__count">{vendors.length} vendors</span>
      </div>

      {vendors.length === 0 ? (
        <div className="vendors-panel__empty">
          <div className="vendors-panel__empty-icon">⬡</div>
          <div className="vendors-panel__empty-title">NO VENDORS YET</div>
          <div className="vendors-panel__empty-sub">Add your suppliers to track contacts, lead times, and link to inventory</div>
          <button className="vendors-panel__empty-btn" onClick={onAdd}>+ ADD VENDOR</button>
        </div>
      ) : (
        <div className="vendors-panel__grid">
          {vendors.map(v => {
            const itemCount = getItemCount(v.name);
            return (
              <div key={v.id} className="vendor-card">
                <div className="vendor-card__header">
                  <div className="vendor-card__name">{v.name}</div>
                  <div className="vendor-card__id">{v.id}</div>
                </div>

                {v.contact && (
                  <div className="vendor-card__contact">{v.contact}</div>
                )}

                <div className="vendor-card__details">
                  {v.email && <span className="vendor-card__detail">✉ {v.email}</span>}
                  {v.phone && <span className="vendor-card__detail">☎ {v.phone}</span>}
                  {v.address && <span className="vendor-card__detail">⌂ {v.address}</span>}
                </div>

                <div className="vendor-card__meta">
                  {v.leadTimeDays != null && (
                    <span className="vendor-card__meta-item">
                      Lead: <strong>{v.leadTimeDays}d</strong>
                    </span>
                  )}
                  {v.minOrder != null && (
                    <span className="vendor-card__meta-item">
                      Min: <strong>${v.minOrder}</strong>
                    </span>
                  )}
                  <span className="vendor-card__meta-item">
                    Items: <strong>{itemCount}</strong>
                  </span>
                </div>

                {v.categories && v.categories.length > 0 && (
                  <div className="vendor-card__categories">
                    {v.categories.map(catId => {
                      const cat = getCategoryById(catId);
                      return (
                        <span
                          key={catId}
                          className="vendor-card__cat-tag"
                          style={{ color: cat.color, background: `${cat.color}15` }}
                        >
                          {cat.name}
                        </span>
                      );
                    })}
                  </div>
                )}

                {v.notes && <div className="vendor-card__notes">{v.notes}</div>}

                <div className="vendor-card__actions">
                  <button className="action-btn action-btn--edit" onClick={() => onEdit(v)}>EDIT</button>
                  <button
                    className={`action-btn action-btn--delete ${confirmDelete === v.id ? 'action-btn--confirm' : ''}`}
                    onClick={() => handleDelete(v.id)}
                  >
                    {confirmDelete === v.id ? 'CONFIRM?' : 'DEL'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
