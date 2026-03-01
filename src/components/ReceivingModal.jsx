import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useReceiving } from '../context/ReceivingContext';
import { useLocations } from '../context/LocationContext';
import '../styles/modal.css';

export default function ReceivingModal({ onClose }) {
  const { inventory, updateItem } = useInventory();
  const { addReceiving } = useReceiving();
  const { locations } = useLocations();

  const [form, setForm] = useState({
    sku: inventory.length > 0 ? inventory[0].sku : '',
    qtyReceived: '',
    costPerUnit: '',
    supplier: '',
    location: locations.length > 0 ? locations[0].id : '',
    notes: '',
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Auto-fill supplier and cost when SKU changes
  function handleSkuChange(sku) {
    const item = inventory.find(i => i.sku === sku);
    setForm(prev => ({
      ...prev,
      sku,
      supplier: item?.supplier || prev.supplier,
      costPerUnit: item?.costPrice || prev.costPerUnit,
      location: item?.location || prev.location,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const item = inventory.find(i => i.sku === form.sku);
    if (!item) return;

    const qtyReceived = Number(form.qtyReceived);

    // Log the receiving event
    await addReceiving({
      sku: form.sku,
      itemName: item.name,
      qtyReceived,
      costPerUnit: form.costPerUnit ? Number(form.costPerUnit) : item.costPrice || 0,
      totalCost: qtyReceived * (form.costPerUnit ? Number(form.costPerUnit) : item.costPrice || 0),
      supplier: form.supplier || item.supplier || '',
      location: form.location,
      notes: form.notes,
    });

    // Update inventory qty
    await updateItem(form.sku, {
      qty: item.qty + qtyReceived,
    });

    onClose();
  }

  const selectedItem = inventory.find(i => i.sku === form.sku);
  const isValid = form.sku && form.qtyReceived && Number(form.qtyReceived) > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>RECEIVE STOCK</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__field">
            <span>Item</span>
            {inventory.length > 0 ? (
              <select value={form.sku} onChange={e => handleSkuChange(e.target.value)}>
                {inventory.map(i => (
                  <option key={i.sku} value={i.sku}>{i.sku} — {i.name}</option>
                ))}
              </select>
            ) : (
              <div className="modal__field-empty">Add items to inventory first</div>
            )}
          </label>

          {selectedItem && (
            <div className="modal__info-row">
              <span>Current stock: <strong>{selectedItem.qty} {selectedItem.unit}</strong></span>
              <span>Reorder at: <strong>{selectedItem.reorder}</strong></span>
            </div>
          )}

          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>Qty Received</span>
              <input
                type="number"
                min="1"
                value={form.qtyReceived}
                onChange={e => handleChange('qtyReceived', e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="modal__field">
              <span>Cost/Unit ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPerUnit}
                onChange={e => handleChange('costPerUnit', e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className="modal__field">
              <span>Location</span>
              {locations.length > 0 ? (
                <select value={form.location} onChange={e => handleChange('location', e.target.value)}>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              ) : (
                <div className="modal__field-empty">—</div>
              )}
            </label>
          </div>

          <div className="modal__row">
            <label className="modal__field">
              <span>Supplier</span>
              <input
                type="text"
                value={form.supplier}
                onChange={e => handleChange('supplier', e.target.value)}
                placeholder="Vendor name"
              />
            </label>
            <label className="modal__field">
              <span>Notes</span>
              <input
                type="text"
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="PO number, condition, etc."
              />
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>CANCEL</button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={!isValid}>
              RECEIVE STOCK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
