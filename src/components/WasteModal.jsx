import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useWaste } from '../context/WasteContext';
import { WASTE_REASONS } from '../data/categories';
import '../styles/modal.css';

export default function WasteModal({ onClose }) {
  const { inventory, updateItem } = useInventory();
  const { addWaste } = useWaste();

  const [form, setForm] = useState({
    sku: inventory.length > 0 ? inventory[0].sku : '',
    qtyWasted: '',
    reason: 'expired',
    notes: '',
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const item = inventory.find(i => i.sku === form.sku);
    if (!item) return;

    const qtyWasted = Number(form.qtyWasted);
    const costLoss = qtyWasted * (item.costPrice || 0);
    const retailLoss = qtyWasted * (item.sellPrice || 0);

    // Log the waste event
    await addWaste({
      sku: form.sku,
      itemName: item.name,
      category: item.category || 'other',
      qtyWasted,
      reason: form.reason,
      costLoss,
      retailLoss,
      location: item.location || '',
      notes: form.notes,
    });

    // Subtract from inventory
    const newQty = Math.max(0, item.qty - qtyWasted);
    await updateItem(form.sku, { qty: newQty });

    onClose();
  }

  const selectedItem = inventory.find(i => i.sku === form.sku);
  const isValid = form.sku && form.qtyWasted && Number(form.qtyWasted) > 0;
  const costPreview = selectedItem && form.qtyWasted
    ? (Number(form.qtyWasted) * (selectedItem.costPrice || 0)).toFixed(2)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>LOG WASTE / SHRINKAGE</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__field">
            <span>Item</span>
            {inventory.length > 0 ? (
              <select value={form.sku} onChange={e => handleChange('sku', e.target.value)}>
                {inventory.map(i => (
                  <option key={i.sku} value={i.sku}>{i.sku} — {i.name} ({i.qty} in stock)</option>
                ))}
              </select>
            ) : (
              <div className="modal__field-empty">Add items to inventory first</div>
            )}
          </label>

          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>Qty Wasted</span>
              <input
                type="number"
                min="1"
                max={selectedItem?.qty || 999}
                value={form.qtyWasted}
                onChange={e => handleChange('qtyWasted', e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="modal__field">
              <span>Reason</span>
              <select value={form.reason} onChange={e => handleChange('reason', e.target.value)}>
                {WASTE_REASONS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </label>
            <div className="modal__field">
              <span>Cost Loss</span>
              <div className="modal__margin modal__margin--negative">
                {costPreview ? `$${costPreview}` : '—'}
              </div>
            </div>
          </div>

          <label className="modal__field">
            <span>Notes</span>
            <input
              type="text"
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Details about the waste event"
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>CANCEL</button>
            <button type="submit" className="modal__btn modal__btn--save modal__btn--warn" disabled={!isValid}>
              LOG WASTE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
