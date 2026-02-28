import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StatusBadge, StockBar } from './ui';
import { WAREHOUSES } from '../data/inventory';
import '../styles/stock-table.css';

const COLUMNS = ["SKU", "Item", "Warehouse", "Qty", "Reorder At", "Level", "Status", ""];

export default function StockTable({ onEdit }) {
  const { inventory, deleteItem } = useInventory();
  const [filter, setFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = inventory.filter(item => {
    const statusMatch =
      filter === "all" ? true :
      filter === "low" ? (item.qty > 0 && item.qty <= item.reorder) :
      filter === "out" ? item.qty === 0 :
      filter === "ok" ? item.qty > item.reorder : true;
    const whMatch = warehouseFilter === "all" || item.warehouse === warehouseFilter;
    return statusMatch && whMatch;
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
          <select
            className="stock-table__select"
            value={warehouseFilter}
            onChange={e => setWarehouseFilter(e.target.value)}
          >
            <option value="all">All Warehouses</option>
            {WAREHOUSES.map(wh => (
              <option key={wh} value={wh}>{wh}</option>
            ))}
          </select>
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
              <td className="cell--warehouse">{item.warehouse}</td>
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
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} className="stock-table__empty">No items match current filters</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
