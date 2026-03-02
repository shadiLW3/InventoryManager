import { useState } from 'react';
import { useVendors } from '../context/VendorContext';
import { CATEGORIES } from '../data/categories';
import '../styles/modal.css';

export default function VendorModal({ vendor, onClose }) {
  const { addVendor, updateVendor } = useVendors();
  const isEdit = !!vendor;

  const [form, setForm] = useState({
    name: vendor?.name || '',
    contact: vendor?.contact || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    leadTimeDays: vendor?.leadTimeDays ?? '',
    minOrder: vendor?.minOrder ?? '',
    categories: vendor?.categories || [],
    notes: vendor?.notes || '',
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleCategory(catId) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : null,
      minOrder: form.minOrder ? Number(form.minOrder) : null,
    };

    if (isEdit) {
      await updateVendor(vendor.id, data);
    } else {
      await addVendor(data);
    }
    onClose();
  }

  const isValid = form.name.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{isEdit ? 'EDIT VENDOR' : 'ADD VENDOR'}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__row">
            <label className="modal__field modal__field--grow">
              <span>Company Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Vendor / supplier name"
              />
            </label>
            <label className="modal__field">
              <span>Contact Person</span>
              <input
                type="text"
                value={form.contact}
                onChange={e => handleChange('contact', e.target.value)}
                placeholder="Name"
              />
            </label>
          </div>

          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="vendor@email.com"
              />
            </label>
            <label className="modal__field">
              <span>Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="(555) 000-0000"
              />
            </label>
            <label className="modal__field">
              <span>Address</span>
              <input
                type="text"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="City, State"
              />
            </label>
          </div>

          <div className="modal__row">
            <label className="modal__field">
              <span>Lead Time (days)</span>
              <input
                type="number"
                min="0"
                value={form.leadTimeDays}
                onChange={e => handleChange('leadTimeDays', e.target.value)}
                placeholder="e.g. 3"
              />
            </label>
            <label className="modal__field">
              <span>Min Order ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrder}
                onChange={e => handleChange('minOrder', e.target.value)}
                placeholder="0.00"
              />
            </label>
          </div>

          <div className="modal__field">
            <span>Categories Supplied</span>
            <div className="modal__tags">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`modal__tag ${form.categories.includes(cat.id) ? 'modal__tag--active' : ''}`}
                  style={form.categories.includes(cat.id) ? { background: `${cat.color}22`, borderColor: cat.color, color: cat.color } : {}}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <label className="modal__field">
            <span>Notes</span>
            <input
              type="text"
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Payment terms, delivery notes, etc."
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>CANCEL</button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={!isValid}>
              {isEdit ? 'SAVE CHANGES' : 'ADD VENDOR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
