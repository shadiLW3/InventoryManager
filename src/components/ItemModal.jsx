import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useVendors } from '../context/VendorContext';
import { CATEGORIES, UNITS } from '../data/categories';
import '../styles/modal.css';

export default function ItemModal({ item, onClose }) {
  const { addItem, updateItem } = useInventory();
  const { locations } = useLocations();
  const { vendors } = useVendors();
  const isEdit = !!item;

  const [form, setForm] = useState({
    sku: item?.sku || '',
    name: item?.name || '',
    category: item?.category || 'other',
    qty: item?.qty ?? '',
    reorder: item?.reorder ?? '',
    unit: item?.unit || 'each',
    costPrice: item?.costPrice ?? '',
    sellPrice: item?.sellPrice ?? '',
    supplier: item?.supplier || '',
    barcode: item?.barcode || '',
    expiryDate: item?.expiryDate || '',
    location: item?.location || (locations.length > 0 ? locations[0].id : ''),
    notes: item?.notes || '',
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      qty: Number(form.qty),
      reorder: Number(form.reorder),
      costPrice: form.costPrice ? Number(form.costPrice) : 0,
      sellPrice: form.sellPrice ? Number(form.sellPrice) : 0,
    };

    if (isEdit) {
      updateItem(item.sku, data);
    } else {
      addItem(data);
    }
    onClose();
  }

  const margin = form.sellPrice && form.costPrice
    ? (((form.sellPrice - form.costPrice) / form.sellPrice) * 100).toFixed(1)
    : null;

  const isValid = form.sku && form.name && form.qty !== '' && form.reorder !== '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{isEdit ? 'EDIT ITEM' : 'ADD NEW ITEM'}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {/* Row 1: SKU + Name */}
          <div className="modal__row">
            <label className="modal__field">
              <span>SKU</span>
              <input
                type="text"
                value={form.sku}
                onChange={e => handleChange('sku', e.target.value)}
                placeholder="SKU-0000"
                disabled={isEdit}
              />
            </label>
            <label className="modal__field modal__field--grow">
              <span>Item Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Organic Whole Milk"
              />
            </label>
          </div>

          {/* Row 2: Category + Location */}
          <div className="modal__row">
            <label className="modal__field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="modal__field">
              <span>Location</span>
              {locations.length > 0 ? (
                <select
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              ) : (
                <div className="modal__field-empty">Add a location first</div>
              )}
            </label>
          </div>

          {/* Row 3: Qty + Reorder + Unit */}
          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>Quantity</span>
              <input
                type="number"
                min="0"
                step="any"
                value={form.qty}
                onChange={e => handleChange('qty', e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="modal__field">
              <span>Reorder At</span>
              <input
                type="number"
                min="0"
                step="any"
                value={form.reorder}
                onChange={e => handleChange('reorder', e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="modal__field">
              <span>Unit</span>
              <select
                value={form.unit}
                onChange={e => handleChange('unit', e.target.value)}
              >
                {UNITS.map(u => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Row 4: Cost + Sell + Margin display */}
          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>Cost Price ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={e => handleChange('costPrice', e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className="modal__field">
              <span>Sell Price ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.sellPrice}
                onChange={e => handleChange('sellPrice', e.target.value)}
                placeholder="0.00"
              />
            </label>
            <div className="modal__field">
              <span>Margin</span>
              <div className={`modal__margin ${margin && margin > 0 ? 'modal__margin--positive' : ''}`}>
                {margin !== null ? `${margin}%` : '—'}
              </div>
            </div>
          </div>

          {/* Row 5: Supplier + Barcode */}
          <div className="modal__row">
            <label className="modal__field">
              <span>Supplier</span>
              {vendors.length > 0 ? (
                <select
                  value={form.supplier}
                  onChange={e => handleChange('supplier', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                  <option value="__custom">Other (type manually)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={form.supplier}
                  onChange={e => handleChange('supplier', e.target.value)}
                  placeholder="Vendor name"
                />
              )}
            </label>
            <label className="modal__field">
              <span>Barcode / UPC</span>
              <input
                type="text"
                value={form.barcode}
                onChange={e => handleChange('barcode', e.target.value)}
                placeholder="012345678901"
              />
            </label>
          </div>

          {/* Custom supplier text input if "Other" is selected */}
          {form.supplier === '__custom' && (
            <label className="modal__field">
              <span>Supplier Name</span>
              <input
                type="text"
                value=""
                onChange={e => handleChange('supplier', e.target.value)}
                placeholder="Type vendor name"
                autoFocus
              />
            </label>
          )}

          {/* Row 6: Expiry + Notes */}
          <div className="modal__row">
            <label className="modal__field">
              <span>Expiry Date</span>
              <input
                type="date"
                value={form.expiryDate}
                onChange={e => handleChange('expiryDate', e.target.value)}
              />
            </label>
            <label className="modal__field modal__field--grow">
              <span>Notes</span>
              <input
                type="text"
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Organic, refrigerated, etc."
              />
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={!isValid}>
              {isEdit ? 'SAVE CHANGES' : 'ADD ITEM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
