import { useState } from 'react';
import { useLocations } from '../context/LocationContext';
import '../styles/locations.css';

export default function LocationsPanel({ onEdit, onAdd }) {
  const { locations, deleteLocation } = useLocations();
  const [confirmDelete, setConfirmDelete] = useState(null);

  function handleDelete(id) {
    if (confirmDelete === id) {
      deleteLocation(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  return (
    <div className="locations">
      <div className="locations__toolbar">
        <h2 className="locations__title">LOCATIONS</h2>
        <span className="locations__count">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
      </div>

      {locations.length === 0 ? (
        <div className="locations__empty">
          <div className="locations__empty-icon">◎</div>
          <div className="locations__empty-title">NO LOCATIONS YET</div>
          <div className="locations__empty-sub">
            Add your first warehouse, office, or storage location
          </div>
          <button className="locations__empty-btn" onClick={onAdd}>+ ADD LOCATION</button>
        </div>
      ) : (
        <div className="locations__grid">
          {locations.map(loc => (
            <div key={loc.id} className="location-card">
              <div className="location-card__header">
                <div className="location-card__name">{loc.name}</div>
                <div className="location-card__id">{loc.id}</div>
              </div>

              {(loc.address || loc.city) && (
                <div className="location-card__address">
                  {loc.address && <span>{loc.address}</span>}
                  {(loc.city || loc.state || loc.zip) && (
                    <span>
                      {[loc.city, loc.state].filter(Boolean).join(', ')}
                      {loc.zip ? ` ${loc.zip}` : ''}
                    </span>
                  )}
                </div>
              )}

              {loc.notes && (
                <div className="location-card__notes">{loc.notes}</div>
              )}

              <div className="location-card__actions">
                <button className="action-btn action-btn--edit" onClick={() => onEdit(loc)}>EDIT</button>
                <button
                  className={`action-btn action-btn--delete ${confirmDelete === loc.id ? 'action-btn--confirm' : ''}`}
                  onClick={() => handleDelete(loc.id)}
                >
                  {confirmDelete === loc.id ? 'CONFIRM?' : 'DEL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
