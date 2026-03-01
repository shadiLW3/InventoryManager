import { useState } from 'react';
import { Logo } from './ui';
import StockTable from './StockTable';
import ChatPanel from './ChatPanel';
import Analytics from './Analytics';
import LocationsPanel from './LocationsPanel';
import ReceivingLog from './ReceivingLog';
import WasteLog from './WasteLog';
import ItemModal from './ItemModal';
import LocationModal from './LocationModal';
import ReceivingModal from './ReceivingModal';
import WasteModal from './WasteModal';
import { useInventory } from '../context/InventoryContext';
import '../styles/dashboard.css';

const TABS = [
  { id: 'chat', label: 'AI' },
  { id: 'stock', label: 'STOCK' },
  { id: 'locations', label: 'LOCATIONS' },
  { id: 'receiving', label: 'RECEIVING' },
  { id: 'waste', label: 'WASTE' },
  { id: 'analytics', label: 'ANALYTICS' },
];

export default function Dashboard({ onBack, onLogout, userName }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [modal, setModal] = useState(null); // 'item' | 'location' | 'receiving' | 'waste'
  const [editItem, setEditItem] = useState(null);
  const [editLocation, setEditLocation] = useState(null);
  const { inventory, loading } = useInventory();

  const lowStockItems = inventory.filter(i => i.qty <= i.reorder);

  // Expiring items
  const expiringItems = inventory.filter(i => {
    if (!i.expiryDate) return false;
    const days = Math.ceil((new Date(i.expiryDate) - new Date()) / (1000*60*60*24));
    return days <= 7 && days >= 0;
  });
  const expiredItems = inventory.filter(i => {
    if (!i.expiryDate) return false;
    return new Date(i.expiryDate) < new Date();
  });

  function handleEditItem(item) {
    setEditItem(item);
    setModal('item');
  }

  function handleAddItem() {
    setEditItem(null);
    setModal('item');
  }

  function handleEditLocation(loc) {
    setEditLocation(loc);
    setModal('location');
  }

  function handleAddLocation() {
    setEditLocation(null);
    setModal('location');
  }

  function closeModal() {
    setModal(null);
    setEditItem(null);
    setEditLocation(null);
  }

  // Tab-specific action buttons
  function getTabAction() {
    switch (activeTab) {
      case 'stock': return <button className="dashboard__add-btn" onClick={handleAddItem}>+ ADD ITEM</button>;
      case 'locations': return <button className="dashboard__add-btn" onClick={handleAddLocation}>+ ADD LOCATION</button>;
      case 'receiving': return <button className="dashboard__add-btn" onClick={() => setModal('receiving')}>+ RECEIVE STOCK</button>;
      case 'waste': return <button className="dashboard__add-btn dashboard__add-btn--warn" onClick={() => setModal('waste')}>+ LOG WASTE</button>;
      default: return null;
    }
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
          </div>
        </div>
        <div className="dashboard__header-right">
          <div className="dashboard__tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`dashboard__tab ${activeTab === tab.id ? "dashboard__tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {getTabAction()}
          <div className="dashboard__user">
            <span className="dashboard__user-name">{userName}</span>
            <button className="dashboard__logout" onClick={onLogout}>LOGOUT</button>
          </div>
        </div>
      </header>

      {/* Alert Bar */}
      {(lowStockItems.length > 0 || expiredItems.length > 0 || expiringItems.length > 0) && (
        <div className="dashboard__alerts">
          {lowStockItems.length > 0 && (
            <>
              <span className="dashboard__alert-label">⚑ LOW STOCK:</span>
              {lowStockItems.slice(0, 5).map(item => (
                <span
                  key={item.sku}
                  className={`dashboard__alert-tag ${item.qty === 0 ? "dashboard__alert-tag--out" : ""}`}
                >
                  {item.sku} {item.qty === 0 ? "OUT" : "LOW"}
                </span>
              ))}
              {lowStockItems.length > 5 && (
                <span className="dashboard__alert-tag">+{lowStockItems.length - 5} more</span>
              )}
            </>
          )}
          {(expiredItems.length > 0 || expiringItems.length > 0) && (
            <>
              <span className="dashboard__alert-divider">|</span>
              <span className="dashboard__alert-label dashboard__alert-label--expiry">⏱ EXPIRY:</span>
              {expiredItems.length > 0 && (
                <span className="dashboard__alert-tag dashboard__alert-tag--expired">
                  {expiredItems.length} EXPIRED
                </span>
              )}
              {expiringItems.length > 0 && (
                <span className="dashboard__alert-tag dashboard__alert-tag--expiring">
                  {expiringItems.length} within 7d
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="dashboard__content">
        {activeTab === "chat" && <ChatPanel />}
        {activeTab === "stock" && <StockTable onEdit={handleEditItem} />}
        {activeTab === "locations" && (
          <LocationsPanel onEdit={handleEditLocation} onAdd={handleAddLocation} />
        )}
        {activeTab === "receiving" && (
          <ReceivingLog onAdd={() => setModal('receiving')} />
        )}
        {activeTab === "waste" && (
          <WasteLog onAdd={() => setModal('waste')} />
        )}
        {activeTab === "analytics" && <Analytics />}
      </div>

      {/* Modals */}
      {modal === 'item' && (
        <ItemModal item={editItem} onClose={closeModal} />
      )}
      {modal === 'location' && (
        <LocationModal location={editLocation} onClose={closeModal} />
      )}
      {modal === 'receiving' && (
        <ReceivingModal onClose={closeModal} />
      )}
      {modal === 'waste' && (
        <WasteModal onClose={closeModal} />
      )}
    </div>
  );
}
