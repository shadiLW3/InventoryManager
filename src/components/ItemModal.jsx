import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { WAREHOUSES } from '../data/inventory';
import '../styles/modal.css';

export default function ItemModal({ item, onClose }) {
  const { addItem, updateItem } = useInventory();
  const isEdit = !!item;

  const [form, setForm] = useState({
    sku: item?.sku || "",
    name: item?.name || "",
    qty: item?.qty ?? "",
    reorder: item?.reorder ?? "",
    unit: item?.unit || "pcs",
    warehouse: item?.warehouse || "WH-01",
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      qty: Number(form.qty),
      reorder: Number(form.reorder),
    };

    if (isEdit) {
      updateItem(item.sku, data);
    } else {
      addItem(data);
    }
    onClose();
  }

  const isValid = form.sku && form.name && form.qty !== "" && form.reorder !== "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{isEdit ? "EDIT ITEM" : "ADD NEW ITEM"}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__row">
            <label className="modal__field">
              <span>SKU</span>
              <input
                type="text"
                value={form.sku}
                onChange={e => handleChange("sku", e.target.value)}
                placeholder="SKU-0000"
                disabled={isEdit}
              />
            </label>
            <label className="modal__field">
              <span>Warehouse</span>
              <select
                value={form.warehouse}
                onChange={e => handleChange("warehouse", e.target.value)}
              >
                {WAREHOUSES.map(wh => (
                  <option key={wh} value={wh}>{wh}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="modal__field">
            <span>Item Name</span>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Item name"
            />
          </label>

          <div className="modal__row modal__row--3">
            <label className="modal__field">
              <span>Quantity</span>
              <input
                type="number"
                min="0"
                value={form.qty}
                onChange={e => handleChange("qty", e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="modal__field">
              <span>Reorder At</span>
              <input
                type="number"
                min="0"
                value={form.reorder}
                onChange={e => handleChange("reorder", e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="modal__field">
              <span>Unit</span>
              <select
                value={form.unit}
                onChange={e => handleChange("unit", e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="packs">packs</option>
                <option value="boxes">boxes</option>
                <option value="kg">kg</option>
                <option value="liters">liters</option>
              </select>
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={!isValid}>
              {isEdit ? "SAVE CHANGES" : "ADD ITEM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
