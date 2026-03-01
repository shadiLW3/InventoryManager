import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { StatusBadge, StockBar } from './ui';
import '../styles/stock-table.css';

const COLUMNS = ["SKU", "Item", "Location", "Qty", "Reorder At", "Level", "Status", ""];

export default function StockTable({ onEdit }) {
  const { inventory, deleteItem } = useInventory();
  const { locations, getLocationName } = useLocations();
  const [filter, setFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = inventory.filter(item => {
    const statusMatch =
      filter === "all" ? true :
      filter === "low" ? (item.qty > 0 && item.qty <= item.reorder) :
      filter === "out" ? item.qty === 0 :
      filter === "ok" ? item.qty > item.reorder : true;
    const locMatch = locationFilter === "all" || item.location === locationFilter;
    return statusMatch && locMatch;
  });

  function handleDelete(sku) {
    if (confirmDelete === sku) {
      deleteItem(sku);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(sku);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  return (
    <div className="stock-table">
      <div className="stock-table__toolbar">
        <h2 className="stock-table__title">STOCK OVERVIEW</h2>
        <div className="stock-table__filters">
          <div className="stock-table__filter-group">
            {["all", "low", "out", "ok"].map(f => (
              <button
                key={f}
                className={`stock-table__filter ${filter === f ? "stock-table__filter--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          {locations.length > 0 && (
            <select
              className="stock-table__select"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="stock-table__count">
        Showing {filtered.length} of {inventory.length} items
      </div>

      <table className="stock-table__table">
        <thead>
          <tr>
            {COLUMNS.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, i) => (
            <tr key={item.sku} className={i % 2 === 1 ? "row--alt" : ""}>
              <td className="cell--sku">{item.sku}</td>
              <td className="cell--name">{item.name}</td>
              <td className="cell--location">{getLocationName(item.location)}</td>
              <td className="cell--qty">{item.qty}</td>
              <td className="cell--reorder">{item.reorder}</td>
              <td><StockBar qty={item.qty} reorder={item.reorder} /></td>
              <td><StatusBadge qty={item.qty} reorder={item.reorder} /></td>
              <td className="cell--actions">
                <button className="action-btn action-btn--edit" onClick={() => onEdit(item)}>EDIT</button>
                <button
                  className={`action-btn action-btn--delete ${confirmDelete === item.sku ? "action-btn--confirm" : ""}`}
                  onClick={() => handleDelete(item.sku)}
                >
                  {confirmDelete === item.sku ? "CONFIRM?" : "DEL"}
                </button>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && inventory.length === 0 && (
            <>
              {[
                { sku: "SKU-0001", name: "Your first product", loc: "Add a location first", qty: "—", reorder: "—" },
                { sku: "SKU-0002", name: "Another item goes here", loc: "Then add items", qty: "—", reorder: "—" },
                { sku: "SKU-0003", name: "Use the + buttons above", loc: "To get started", qty: "—", reorder: "—" },
              ].map((g, i) => (
                <tr key={i} className="row--ghost">
                  <td className="cell--sku">{g.sku}</td>
                  <td className="cell--name">{g.name}</td>
                  <td className="cell--location">{g.loc}</td>
                  <td className="cell--qty">{g.qty}</td>
                  <td className="cell--reorder">{g.reorder}</td>
                  <td><div style={{ height: 3, width: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }} /></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: '#2a2a2a', letterSpacing: '0.1em' }}>—</span></td>
                  <td></td>
                </tr>
              ))}
            </>
          )}
          {filtered.length === 0 && inventory.length > 0 && (
            <tr>
              <td colSpan={8} className="stock-table__empty">No items match current filters</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
