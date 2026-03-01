import { useState } from 'react';
import { useLocations } from '../context/LocationContext';
import '../styles/modal.css';

export default function LocationModal({ location, onClose }) {
  const { addLocation, updateLocation } = useLocations();
  const isEdit = !!location;

  const [form, setForm] = useState({
    name: location?.name || '',
    address: location?.address || '',
    city: location?.city || '',
    state: location?.state || '',
    zip: location?.zip || '',
    notes: location?.notes || '',
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isEdit) {
      await updateLocation(location.id, form);
    } else {
      await addLocation(form);
    }
    onClose();
  }

  const isValid = form.name.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{isEdit ? 'EDIT LOCATION' : 'ADD LOCATION'}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__field">
            <span>Location Name</span>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Main Warehouse, NYC Office, etc."
            />
          </label>

          <label className="modal__field">
            <span>Street Address</span>
            <input
              type="text"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              placeholder="123 Storage Blvd"
            />
          </label>

          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>City</span>
              <input
                type="text"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="City"
              />
            </label>
            <label className="modal__field">
              <span>State</span>
              <input
                type="text"
                value={form.state}
                onChange={e => handleChange('state', e.target.value)}
                placeholder="State"
              />
            </label>
            <label className="modal__field">
              <span>ZIP</span>
              <input
                type="text"
                value={form.zip}
                onChange={e => handleChange('zip', e.target.value)}
                placeholder="ZIP"
              />
            </label>
          </div>

          <label className="modal__field">
            <span>Notes (optional)</span>
            <input
              type="text"
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Dock hours, contact info, etc."
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={!isValid}>
              {isEdit ? 'SAVE CHANGES' : 'ADD LOCATION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
