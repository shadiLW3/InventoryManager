import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { StatusBadge, StockBar, ExpiryBadge, CategoryTag } from './ui';
import { CATEGORIES } from '../data/categories';
import '../styles/stock-table.css';

const COLUMNS = ["SKU", "Item", "Cat", "Location", "Qty", "Price", "Expiry", "Status", ""];

export default function StockTable({ onEdit }) {
  const { inventory, deleteItem } = useInventory();
  const { locations, getLocationName } = useLocations();
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = inventory.filter(item => {
    const statusMatch =
      filter === "all" ? true :
      filter === "low" ? (item.qty > 0 && item.qty <= item.reorder) :
      filter === "out" ? item.qty === 0 :
      filter === "ok" ? item.qty > item.reorder :
      filter === "expiring" ? (() => {
        if (!item.expiryDate) return false;
        const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000*60*60*24));
        return days <= 7;
      })() : true;
    const catMatch = categoryFilter === "all" || item.category === categoryFilter;
    const locMatch = locationFilter === "all" || item.location === locationFilter;
    return statusMatch && catMatch && locMatch;
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
            {["all", "low", "out", "ok", "expiring"].map(f => (
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
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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

      <div className="stock-table__scroll">
        <table className="stock-table__table">
          <thead>
            <tr>
              {COLUMNS.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const margin = item.sellPrice && item.costPrice
                ? (((item.sellPrice - item.costPrice) / item.sellPrice) * 100).toFixed(0)
                : null;

              return (
                <tr key={item.sku} className={i % 2 === 1 ? "row--alt" : ""}>
                  <td className="cell--sku">{item.sku}</td>
                  <td className="cell--name">
                    {item.name}
                    {item.supplier && <span className="cell--supplier">{item.supplier}</span>}
                  </td>
                  <td><CategoryTag category={item.category} /></td>
                  <td className="cell--location">{getLocationName(item.location)}</td>
                  <td className="cell--qty">
                    {item.qty} <span className="cell--unit">{item.unit}</span>
                  </td>
                  <td className="cell--price">
                    {item.sellPrice ? `$${item.sellPrice.toFixed(2)}` : '—'}
                    {margin && <span className="cell--margin">{margin}%</span>}
                  </td>
                  <td><ExpiryBadge date={item.expiryDate} /></td>
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
              );
            })}

            {filtered.length === 0 && inventory.length === 0 && (
              <>
                {[
                  { sku: "SKU-0001", name: "Your first product", loc: "Add a location first" },
                  { sku: "SKU-0002", name: "Another item goes here", loc: "Then add items" },
                  { sku: "SKU-0003", name: "Use the + buttons above", loc: "To get started" },
                ].map((g, i) => (
                  <tr key={i} className="row--ghost">
                    <td className="cell--sku">{g.sku}</td>
                    <td className="cell--name">{g.name}</td>
                    <td>—</td>
                    <td className="cell--location">{g.loc}</td>
                    <td className="cell--qty">—</td>
                    <td className="cell--price">—</td>
                    <td>—</td>
                    <td>—</td>
                    <td></td>
                  </tr>
                ))}
              </>
            )}
            {filtered.length === 0 && inventory.length > 0 && (
              <tr>
                <td colSpan={9} className="stock-table__empty">No items match current filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
