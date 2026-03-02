import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useVendors } from '../context/VendorContext';
import { getCategoryById } from '../data/categories';
import '../styles/purchase-orders.css';

export default function PurchaseOrders() {
  const { inventory } = useInventory();
  const { getLocationName } = useLocations();
  const { vendors } = useVendors();

  const [selectedItems, setSelectedItems] = useState({});
  const [groupBy, setGroupBy] = useState('supplier'); // 'supplier' | 'none'
  const [showGenerated, setShowGenerated] = useState(null);

  // Items that need reordering
  const reorderItems = useMemo(() => {
    return inventory
      .filter(i => i.qty <= i.reorder)
      .map(i => {
        const deficit = i.reorder - i.qty;
        // Suggest ordering 2x deficit or up to reorder * 2
        const suggestedQty = Math.max(deficit, i.reorder);
        return {
          ...i,
          deficit,
          suggestedQty,
          estCost: suggestedQty * (i.costPrice || 0),
        };
      })
      .sort((a, b) => b.deficit - a.deficit);
  }, [inventory]);

  function toggleItem(sku) {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[sku]) {
        delete next[sku];
      } else {
        const item = reorderItems.find(i => i.sku === sku);
        next[sku] = { qty: item.suggestedQty };
      }
      return next;
    });
  }

  function selectAll() {
    const all = {};
    reorderItems.forEach(i => {
      all[i.sku] = { qty: i.suggestedQty };
    });
    setSelectedItems(all);
  }

  function clearAll() {
    setSelectedItems({});
  }

  function updateQty(sku, qty) {
    setSelectedItems(prev => ({
      ...prev,
      [sku]: { qty: Math.max(1, Number(qty) || 1) },
    }));
  }

  // Group selected items by supplier
  const grouped = useMemo(() => {
    const selected = reorderItems.filter(i => selectedItems[i.sku]);
    if (groupBy === 'none') return { 'All Items': selected };

    const groups = {};
    selected.forEach(item => {
      const key = item.supplier || 'Unassigned';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [reorderItems, selectedItems, groupBy]);

  function generatePO() {
    const now = new Date();
    const poNumber = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const orders = Object.entries(grouped).map(([supplier, items]) => {
      const vendor = vendors.find(v => v.name.toLowerCase() === supplier.toLowerCase());
      return {
        supplier,
        vendor,
        poNumber: `${poNumber}-${supplier.slice(0, 3).toUpperCase()}`,
        date: now.toISOString().split('T')[0],
        items: items.map(i => ({
          sku: i.sku,
          name: i.name,
          orderQty: selectedItems[i.sku]?.qty || i.suggestedQty,
          unit: i.unit,
          costPrice: i.costPrice || 0,
          total: (selectedItems[i.sku]?.qty || i.suggestedQty) * (i.costPrice || 0),
        })),
      };
    });
    orders.forEach(o => {
      o.totalCost = o.items.reduce((sum, i) => sum + i.total, 0);
    });
    setShowGenerated(orders);
  }

  const selectedCount = Object.keys(selectedItems).length;
  const totalEstCost = reorderItems
    .filter(i => selectedItems[i.sku])
    .reduce((sum, i) => sum + (selectedItems[i.sku].qty * (i.costPrice || 0)), 0);

  if (reorderItems.length === 0) {
    return (
      <div className="po-panel">
        <div className="po-panel__empty">
          <div className="po-panel__empty-icon">✓</div>
          <div className="po-panel__empty-title">ALL STOCKED UP</div>
          <div className="po-panel__empty-sub">No items are below reorder threshold</div>
        </div>
      </div>
    );
  }

  if (showGenerated) {
    return (
      <div className="po-panel">
        <div className="po-panel__toolbar">
          <h2 className="po-panel__title">GENERATED ORDERS</h2>
          <button className="po-panel__back-btn" onClick={() => setShowGenerated(null)}>← BACK TO LIST</button>
        </div>

        <div className="po-generated">
          {showGenerated.map((order, idx) => (
            <div key={idx} className="po-card">
              <div className="po-card__header">
                <div>
                  <div className="po-card__po-num">{order.poNumber}</div>
                  <div className="po-card__date">{order.date}</div>
                </div>
                <div className="po-card__supplier">
                  <div className="po-card__supplier-name">{order.supplier}</div>
                  {order.vendor?.email && <div className="po-card__supplier-email">{order.vendor.email}</div>}
                  {order.vendor?.leadTimeDays != null && (
                    <div className="po-card__lead">Est. delivery: {order.vendor.leadTimeDays} days</div>
                  )}
                </div>
              </div>

              <table className="po-card__table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.sku}>
                      <td className="cell--sku">{item.sku}</td>
                      <td>{item.name}</td>
                      <td className="cell--qty">{item.orderQty} {item.unit}</td>
                      <td>${item.costPrice.toFixed(2)}</td>
                      <td className="po-card__item-total">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="po-card__total-label">ORDER TOTAL</td>
                    <td className="po-card__total-val">${order.totalCost.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}

          <div className="po-grand-total">
            Grand Total: ${showGenerated.reduce((sum, o) => sum + o.totalCost, 0).toFixed(2)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="po-panel">
      <div className="po-panel__toolbar">
        <h2 className="po-panel__title">PURCHASE ORDERS</h2>
        <div className="po-panel__toolbar-actions">
          <button className="po-panel__select-btn" onClick={selectedCount === reorderItems.length ? clearAll : selectAll}>
            {selectedCount === reorderItems.length ? 'DESELECT ALL' : 'SELECT ALL'}
          </button>
          <select
            className="stock-table__select"
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
          >
            <option value="supplier">Group by Supplier</option>
            <option value="none">No Grouping</option>
          </select>
        </div>
      </div>

      <div className="po-panel__count">
        {reorderItems.length} items need reorder · {selectedCount} selected
        {totalEstCost > 0 && <span className="po-panel__est-cost"> · Est. ${totalEstCost.toFixed(2)}</span>}
      </div>

      <div className="po-list">
        {reorderItems.map(item => {
          const isSelected = !!selectedItems[item.sku];
          const margin = item.sellPrice && item.costPrice
            ? (((item.sellPrice - item.costPrice) / item.sellPrice) * 100).toFixed(0)
            : null;

          return (
            <div
              key={item.sku}
              className={`po-item ${isSelected ? 'po-item--selected' : ''}`}
              onClick={() => toggleItem(item.sku)}
            >
              <div className="po-item__check">{isSelected ? '☑' : '☐'}</div>
              <div className="po-item__info">
                <div className="po-item__name">
                  <span className="po-item__sku">{item.sku}</span>
                  {item.name}
                </div>
                <div className="po-item__meta">
                  <span>{getCategoryById(item.category).name}</span>
                  <span>{getLocationName(item.location)}</span>
                  {item.supplier && <span>Supplier: {item.supplier}</span>}
                </div>
              </div>
              <div className="po-item__stock">
                <span className="po-item__current">{item.qty} / {item.reorder}</span>
                <span className="po-item__deficit">need +{item.deficit}</span>
              </div>
              {isSelected && (
                <div className="po-item__order-qty" onClick={e => e.stopPropagation()}>
                  <label>
                    <span>Order:</span>
                    <input
                      type="number"
                      min="1"
                      value={selectedItems[item.sku]?.qty || item.suggestedQty}
                      onChange={e => updateQty(item.sku, e.target.value)}
                    />
                  </label>
                  <span className="po-item__est">
                    ≈ ${((selectedItems[item.sku]?.qty || item.suggestedQty) * (item.costPrice || 0)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div className="po-panel__footer">
          <div className="po-panel__footer-info">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} · ${totalEstCost.toFixed(2)} estimated
          </div>
          <button className="po-panel__generate-btn" onClick={generatePO}>
            GENERATE PO →
          </button>
        </div>
      )}
    </div>
  );
}
