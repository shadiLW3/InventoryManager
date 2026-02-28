import { useInventory } from '../context/InventoryContext';
import { StatCard } from './ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/analytics.css';

const CHART_COLORS = {
  ok: '#4caf6e',
  low: 'rgb(255, 131, 48)',
  out: '#ff4444',
};

const CUSTOM_TOOLTIP_STYLE = {
  background: '#1c1c1c',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '3px',
  padding: '0.5rem 0.8rem',
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.72rem',
  color: '#e8e8e0',
};

export default function Analytics() {
  const { inventory } = useInventory();

  const totalItems = inventory.length;
  const totalQty = inventory.reduce((sum, i) => sum + i.qty, 0);
  const lowStock = inventory.filter(i => i.qty > 0 && i.qty <= i.reorder);
  const outOfStock = inventory.filter(i => i.qty === 0);
  const okItems = inventory.filter(i => i.qty > i.reorder);

  // Warehouse breakdown
  const warehouseData = {};
  inventory.forEach(item => {
    if (!warehouseData[item.warehouse]) {
      warehouseData[item.warehouse] = { name: item.warehouse, total: 0, low: 0, out: 0, ok: 0 };
    }
    warehouseData[item.warehouse].total += item.qty;
    if (item.qty === 0) warehouseData[item.warehouse].out++;
    else if (item.qty <= item.reorder) warehouseData[item.warehouse].low++;
    else warehouseData[item.warehouse].ok++;
  });
  const whBarData = Object.values(warehouseData);

  // Status distribution for pie
  const statusData = [
    { name: 'OK', value: okItems.length, color: CHART_COLORS.ok },
    { name: 'Low', value: lowStock.length, color: CHART_COLORS.low },
    { name: 'Out', value: outOfStock.length, color: CHART_COLORS.out },
  ].filter(d => d.value > 0);

  // Top items needing reorder (sorted by urgency)
  const reorderList = inventory
    .filter(i => i.qty <= i.reorder)
    .map(i => ({
      name: i.name,
      sku: i.sku,
      qty: i.qty,
      reorder: i.reorder,
      deficit: i.reorder - i.qty,
    }))
    .sort((a, b) => b.deficit - a.deficit);

  return (
    <div className="analytics">
      {/* Stat Cards */}
      <div className="analytics__stats">
        <StatCard label="Total SKUs" value={totalItems} sub={`${totalQty} units in stock`} />
        <StatCard label="Low Stock" value={lowStock.length} sub="items below threshold" color="var(--orange)" />
        <StatCard label="Out of Stock" value={outOfStock.length} sub="need immediate reorder" color="var(--red)" />
        <StatCard label="Healthy" value={okItems.length} sub="items above threshold" color="var(--green)" />
      </div>

      <div className="analytics__charts">
        {/* Warehouse Bar Chart */}
        <div className="analytics__chart-card">
          <h3 className="analytics__chart-title">STOCK BY WAREHOUSE</h3>
          <div className="analytics__chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={whBarData} barGap={4}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#7a7a72', fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#555', fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                labelStyle={{ color: '#e8e8e0', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', marginBottom: '0.3rem' }}
                itemStyle={{ color: '#e8e8e0', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' }}
                wrapperStyle={{ outline: 'none' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="ok" name="OK" fill={CHART_COLORS.ok} radius={[2, 2, 0, 0]} />
                <Bar dataKey="low" name="Low" fill={CHART_COLORS.low} radius={[2, 2, 0, 0]} />
                <Bar dataKey="out" name="Out" fill={CHART_COLORS.out} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie */}
        <div className="analytics__chart-card">
          <h3 className="analytics__chart-title">STOCK HEALTH</h3>
          <div className="analytics__chart-body analytics__chart-body--pie">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                labelStyle={{ display: 'none' }}
                itemStyle={{ color: '#e8e8e0', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' }}
                wrapperStyle={{ outline: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="analytics__pie-legend">
              {statusData.map(d => (
                <div key={d.name} className="analytics__legend-item">
                  <span className="analytics__legend-dot" style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <span className="analytics__legend-val">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Priority */}
      {reorderList.length > 0 && (
        <div className="analytics__reorder">
          <h3 className="analytics__chart-title">REORDER PRIORITY</h3>
          <div className="analytics__reorder-list">
            {reorderList.map((item, i) => (
              <div key={item.sku} className="analytics__reorder-item">
                <span className="analytics__reorder-rank">{i + 1}</span>
                <div className="analytics__reorder-info">
                  <span className="analytics__reorder-name">{item.name}</span>
                  <span className="analytics__reorder-sku">{item.sku}</span>
                </div>
                <div className="analytics__reorder-nums">
                  <span className="analytics__reorder-qty">{item.qty} / {item.reorder}</span>
                  <span className="analytics__reorder-deficit">need +{item.deficit}</span>
                </div>
                <div className="analytics__reorder-bar">
                  <div
                    className="analytics__reorder-bar-fill"
                    style={{
                      width: `${Math.max((item.qty / item.reorder) * 100, 2)}%`,
                      background: item.qty === 0 ? 'var(--red)' : 'var(--orange)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
