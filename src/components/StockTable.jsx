import { INVENTORY } from '../data/inventory';
import { StatusBadge, StockBar } from './ui';
import '../styles/stock-table.css';

const COLUMNS = ["SKU", "Item", "Warehouse", "Qty", "Reorder At", "Level", "Status"];

export default function StockTable() {
  return (
    <div className="stock-table">
      <h2 className="stock-table__title">STOCK OVERVIEW</h2>
      <table className="stock-table__table">
        <thead>
          <tr>
            {COLUMNS.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {INVENTORY.map((item, i) => (
            <tr key={item.sku} className={i % 2 === 1 ? "row--alt" : ""}>
              <td className="cell--sku">{item.sku}</td>
              <td className="cell--name">{item.name}</td>
              <td className="cell--warehouse">{item.warehouse}</td>
              <td className="cell--qty">{item.qty}</td>
              <td className="cell--reorder">{item.reorder}</td>
              <td><StockBar qty={item.qty} reorder={item.reorder} /></td>
              <td><StatusBadge qty={item.qty} reorder={item.reorder} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
