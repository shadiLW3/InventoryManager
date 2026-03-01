import { useState } from 'react';
import { Logo } from './ui';
import StockTable from './StockTable';
import ChatPanel from './ChatPanel';
import Analytics from './Analytics';
import LocationsPanel from './LocationsPanel';
import ItemModal from './ItemModal';
import LocationModal from './LocationModal';
import { useInventory } from '../context/InventoryContext';
import '../styles/dashboard.css';

export default function Dashboard({ onBack, onLogout, userName }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [showItemModal, setShowItemModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLocation, setEditLocation] = useState(null);
  const { inventory, loading } = useInventory();

  const lowStockItems = inventory.filter(i => i.qty <= i.reorder);

  function handleEditItem(item) {
    setEditItem(item);
    setShowItemModal(true);
  }

  function handleAddItem() {
    setEditItem(null);
    setShowItemModal(true);
  }

  function handleEditLocation(loc) {
    setEditLocation(loc);
    setShowLocationModal(true);
  }

  function handleAddLocation() {
    setEditLocation(null);
    setShowLocationModal(true);
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <span>SYNCING INVENTORY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <button className="dashboard__back" onClick={onBack}>← BACK</button>
          <div className="dashboard__brand">
            <Logo size="1.4rem" />
            <span className="dashboard__badge">AI CONSOLE</span>
          </div>
        </div>
        <div className="dashboard__header-right">
          <div className="dashboard__tabs">
            {["chat", "stock", "locations", "analytics"].map(tab => (
              <button
                key={tab}
                className={`dashboard__tab ${activeTab === tab ? "dashboard__tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "stock" && (
            <button className="dashboard__add-btn" onClick={handleAddItem}>+ ADD ITEM</button>
          )}
          {activeTab === "locations" && (
            <button className="dashboard__add-btn" onClick={handleAddLocation}>+ ADD LOCATION</button>
          )}
          <div className="dashboard__user">
            <span className="dashboard__user-name">{userName}</span>
            <button className="dashboard__logout" onClick={onLogout}>LOGOUT</button>
          </div>
        </div>
      </header>

      {/* Alert Bar */}
      {lowStockItems.length > 0 && (
        <div className="dashboard__alerts">
          <span>⚑ ALERTS:</span>
          {lowStockItems.map(item => (
            <span
              key={item.sku}
              className={`dashboard__alert-tag ${item.qty === 0 ? "dashboard__alert-tag--out" : ""}`}
            >
              {item.sku} {item.qty === 0 ? "OUT" : "LOW"}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="dashboard__content">
        {activeTab === "chat" && <ChatPanel />}
        {activeTab === "stock" && <StockTable onEdit={handleEditItem} />}
        {activeTab === "locations" && (
          <LocationsPanel onEdit={handleEditLocation} onAdd={handleAddLocation} />
        )}
        {activeTab === "analytics" && <Analytics />}
      </div>

      {/* Modals */}
      {showItemModal && (
        <ItemModal
          item={editItem}
          onClose={() => { setShowItemModal(false); setEditItem(null); }}
        />
      )}
      {showLocationModal && (
        <LocationModal
          location={editLocation}
          onClose={() => { setShowLocationModal(false); setEditLocation(null); }}
        />
      )}
    </div>
  );
}
