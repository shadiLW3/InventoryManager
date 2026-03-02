import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { StatusBadge, ExpiryBadge, CategoryTag } from './ui';
import { CATEGORIES, daysUntilExpiry } from '../data/categories';
import '../styles/stock-table.css';

const SORTABLE = {
  sku: { label: 'SKU', fn: (a, b) => a.sku.localeCompare(b.sku) },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
  qty: { label: 'Qty', fn: (a, b) => a.qty - b.qty },
  price: { label: 'Price', fn: (a, b) => (a.sellPrice || 0) - (b.sellPrice || 0) },
  margin: {
    label: 'Margin',
    fn: (a, b) => {
      const ma = a.sellPrice && a.costPrice ? (a.sellPrice - a.costPrice) / a.sellPrice : 0;
      const mb = b.sellPrice && b.costPrice ? (b.sellPrice - b.costPrice) / b.sellPrice : 0;
      return ma - mb;
    },
  },
  expiry: {
    label: 'Expiry',
    fn: (a, b) => {
      const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return da - db;
    },
  },
};

const COLUMNS = ["SKU", "Item", "Cat", "Location", "Qty", "Price", "Expiry", "Status", ""];

export default function StockTable({ onEdit }) {
  const { inventory, deleteItem } = useInventory();
  const { locations, getLocationName } = useLocations();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    let items = [...inventory];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.supplier?.toLowerCase().includes(q) ||
        i.barcode?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q)
      );
    }

    // Status filter
    items = items.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'low') return item.qty > 0 && item.qty <= item.reorder;
      if (filter === 'out') return item.qty === 0;
      if (filter === 'ok') return item.qty > item.reorder;
      if (filter === 'expiring') {
        const days = daysUntilExpiry(item.expiryDate);
        return days !== null && days <= 7;
      }
      return true;
    });

    // Category filter
    if (categoryFilter !== 'all') {
      items = items.filter(i => i.category === categoryFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      items = items.filter(i => i.location === locationFilter);
    }

    // Sort
    const sorter = SORTABLE[sortKey];
    if (sorter) {
      items.sort((a, b) => {
        const result = sorter.fn(a, b);
        return sortDir === 'asc' ? result : -result;
      });
    }

    return items;
  }, [inventory, search, filter, categoryFilter, locationFilter, sortKey, sortDir]);

  function handleDelete(sku) {
    if (confirmDelete === sku) {
      deleteItem(sku);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(sku);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  function SortBtn({ sKey, children }) {
    const active = sortKey === sKey;
    return (
      <button
        className={`stock-table__sort ${active ? 'stock-table__sort--active' : ''}`}
        onClick={() => toggleSort(sKey)}
      >
        {children}
        {active && <span className="stock-table__sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    );
  }

  return (
    <div className="stock-table">
      <div className="stock-table__toolbar">
        <h2 className="stock-table__title">STOCK OVERVIEW</h2>
        <div className="stock-table__search-wrap">
          <input
            className="stock-table__search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU, name, supplier, barcode..."
          />
          {search && (
            <button className="stock-table__search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      <div className="stock-table__filters">
        <div className="stock-table__filter-group">
          {['all', 'low', 'out', 'ok', 'expiring'].map(f => (
            <button
              key={f}
              className={`stock-table__filter ${filter === f ? 'stock-table__filter--active' : ''}`}
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
        <div className="stock-table__sort-group">
          <span className="stock-table__sort-label">Sort:</span>
          <SortBtn sKey="name">Name</SortBtn>
          <SortBtn sKey="qty">Qty</SortBtn>
          <SortBtn sKey="price">Price</SortBtn>
          <SortBtn sKey="margin">Margin</SortBtn>
          <SortBtn sKey="expiry">Expiry</SortBtn>
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
                <tr key={item.sku} className={i % 2 === 1 ? 'row--alt' : ''}>
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
                      className={`action-btn action-btn--delete ${confirmDelete === item.sku ? 'action-btn--confirm' : ''}`}
                      onClick={() => handleDelete(item.sku)}
                    >
                      {confirmDelete === item.sku ? 'CONFIRM?' : 'DEL'}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && inventory.length === 0 && (
              <>
                {[
                  { sku: 'SKU-0001', name: 'Your first product', loc: 'Add a location first' },
                  { sku: 'SKU-0002', name: 'Another item goes here', loc: 'Then add items' },
                  { sku: 'SKU-0003', name: 'Use the + buttons above', loc: 'To get started' },
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
                <td colSpan={9} className="stock-table__empty">
                  {search ? `No results for "${search}"` : 'No items match current filters'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
