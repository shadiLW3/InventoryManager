import { useState } from 'react';
import { Logo } from './ui';
import StockTable from './StockTable';
import ChatPanel from './ChatPanel';
import Analytics from './Analytics';
import ItemModal from './ItemModal';
import { useInventory } from '../context/InventoryContext';
import '../styles/dashboard.css';

export default function Dashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { inventory } = useInventory();

  const lowStockItems = inventory.filter(i => i.qty <= i.reorder);

  function handleEdit(item) {
    setEditItem(item);
    setShowModal(true);
  }

  function handleAdd() {
    setEditItem(null);
    setShowModal(true);
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
            {["chat", "stock", "analytics"].map(tab => (
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
            <button className="dashboard__add-btn" onClick={handleAdd}>+ ADD ITEM</button>
          )}
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
        {activeTab === "stock" && <StockTable onEdit={handleEdit} />}
        {activeTab === "analytics" && <Analytics />}
      </div>

      {/* Modal */}
      {showModal && (
        <ItemModal
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}
