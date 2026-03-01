import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useWaste } from '../context/WasteContext';
import { useReceiving } from '../context/ReceivingContext';
import { StatCard } from './ui';
import { CATEGORIES, getCategoryById, daysUntilExpiry } from '../data/categories';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/analytics.css';

const TOOLTIP_STYLE = {
  background: '#1c1c1c',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '3px',
  padding: '0.5rem 0.8rem',
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.72rem',
  color: '#e8e8e0',
};
const TOOLTIP_LABEL = { color: '#e8e8e0', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', marginBottom: '0.3rem' };
const TOOLTIP_ITEM = { color: '#e8e8e0', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' };

export default function Analytics() {
  const { inventory } = useInventory();
  const { locations, getLocationName } = useLocations();
  const { wasteLog } = useWaste();
  const { receivingLog } = useReceiving();

  const totalItems = inventory.length;
  const lowStock = inventory.filter(i => i.qty > 0 && i.qty <= i.reorder);
  const outOfStock = inventory.filter(i => i.qty === 0);
  const okItems = inventory.filter(i => i.qty > i.reorder);

  // Value calculations
  const totalCostValue = inventory.reduce((sum, i) => sum + (i.qty * (i.costPrice || 0)), 0);
  const totalRetailValue = inventory.reduce((sum, i) => sum + (i.qty * (i.sellPrice || 0)), 0);
  const avgMargin = inventory.filter(i => i.sellPrice && i.costPrice).length > 0
    ? inventory
        .filter(i => i.sellPrice && i.costPrice)
        .reduce((sum, i) => sum + ((i.sellPrice - i.costPrice) / i.sellPrice * 100), 0)
      / inventory.filter(i => i.sellPrice && i.costPrice).length
    : 0;

  // Expiry tracking
  const expiringItems = inventory.filter(i => {
    const days = daysUntilExpiry(i.expiryDate);
    return days !== null && days <= 7;
  }).sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  // Waste summary
  const totalWasteCost = wasteLog.reduce((sum, e) => sum + (e.costLoss || 0), 0);
  const wasteByReason = {};
  wasteLog.forEach(e => {
    const reason = e.reason || 'other';
    if (!wasteByReason[reason]) wasteByReason[reason] = { name: reason, qty: 0, cost: 0 };
    wasteByReason[reason].qty += e.qtyWasted || 0;
    wasteByReason[reason].cost += e.costLoss || 0;
  });
  const wasteReasonData = Object.values(wasteByReason).sort((a, b) => b.cost - a.cost);
  const wasteColors = ['#ff4444', '#ff6666', '#ff8a65', '#ffb74d', '#ffd54f', '#90a4ae'];

  // Category breakdown
  const categoryData = {};
  inventory.forEach(item => {
    const cat = getCategoryById(item.category);
    if (!categoryData[cat.id]) {
      categoryData[cat.id] = { name: cat.name, color: cat.color, items: 0, value: 0, margin: [] };
    }
    categoryData[cat.id].items++;
    categoryData[cat.id].value += (item.qty * (item.sellPrice || 0));
    if (item.sellPrice && item.costPrice) {
      categoryData[cat.id].margin.push((item.sellPrice - item.costPrice) / item.sellPrice * 100);
    }
  });
  const catBarData = Object.values(categoryData).map(d => ({
    ...d,
    avgMargin: d.margin.length > 0 ? (d.margin.reduce((a, b) => a + b, 0) / d.margin.length).toFixed(1) : 0,
  })).sort((a, b) => b.value - a.value);

  // Status pie
  const statusData = [
    { name: 'OK', value: okItems.length, color: '#4caf6e' },
    { name: 'Low', value: lowStock.length, color: 'rgb(255, 131, 48)' },
    { name: 'Out', value: outOfStock.length, color: '#ff4444' },
  ].filter(d => d.value > 0);

  // Reorder priority
  const reorderList = inventory
    .filter(i => i.qty <= i.reorder)
    .map(i => ({
      name: i.name,
      sku: i.sku,
      qty: i.qty,
      reorder: i.reorder,
      deficit: i.reorder - i.qty,
      reorderCost: (i.reorder - i.qty) * (i.costPrice || 0),
      location: getLocationName(i.location),
      category: getCategoryById(i.category).name,
    }))
    .sort((a, b) => b.deficit - a.deficit);

  if (totalItems === 0) {
    return (
      <div className="analytics">
        <div className="analytics__empty">
          <div className="analytics__empty-title">NO DATA YET</div>
          <div className="analytics__empty-sub">Add locations and items to see analytics</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Stat Cards */}
      <div className="analytics__stats">
        <StatCard label="Total SKUs" value={totalItems} sub={`$${totalRetailValue.toFixed(0)} retail value`} />
        <StatCard label="Avg Margin" value={`${avgMargin.toFixed(1)}%`} sub={`$${totalCostValue.toFixed(0)} cost value`} color="var(--orange)" />
        <StatCard label="Expiring Soon" value={expiringItems.length} sub="within 7 days" color={expiringItems.length > 0 ? '#ff6666' : '#4caf6e'} />
        <StatCard label="Waste Loss" value={`$${totalWasteCost.toFixed(0)}`} sub={`${wasteLog.length} events logged`} color={totalWasteCost > 0 ? '#ff4444' : '#4caf6e'} />
      </div>

      <div className="analytics__charts">
        {/* Category Value Chart */}
        {catBarData.length > 0 && (
          <div className="analytics__chart-card">
            <h3 className="analytics__chart-title">VALUE BY CATEGORY</h3>
            <div className="analytics__chart-body">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catBarData} barGap={4}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#7a7a72', fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: '#555', fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL}
                    itemStyle={TOOLTIP_ITEM}
                    wrapperStyle={{ outline: 'none' }}
                    formatter={(v, name) => name === 'value' ? `$${v.toFixed(2)}` : v}
                  />
                  <Bar dataKey="value" name="Retail Value" radius={[2, 2, 0, 0]}>
                    {catBarData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Status Pie */}
        {statusData.length > 0 && (
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
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ display: 'none' }}
                    itemStyle={TOOLTIP_ITEM}
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
        )}
      </div>

      {/* Expiring Items */}
      {expiringItems.length > 0 && (
        <div className="analytics__section">
          <h3 className="analytics__chart-title">⚠ EXPIRING SOON</h3>
          <div className="analytics__expiry-list">
            {expiringItems.map(item => {
              const days = daysUntilExpiry(item.expiryDate);
              return (
                <div key={item.sku} className={`analytics__expiry-item ${days <= 0 ? 'analytics__expiry-item--expired' : days <= 3 ? 'analytics__expiry-item--critical' : ''}`}>
                  <div className="analytics__expiry-info">
                    <span className="analytics__expiry-sku">{item.sku}</span>
                    <span className="analytics__expiry-name">{item.name}</span>
                  </div>
                  <span className="analytics__expiry-qty">{item.qty} {item.unit}</span>
                  <span className="analytics__expiry-days">
                    {days <= 0 ? 'EXPIRED' : `${days} day${days > 1 ? 's' : ''}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Waste by Reason */}
      {wasteReasonData.length > 0 && (
        <div className="analytics__charts">
          <div className="analytics__chart-card">
            <h3 className="analytics__chart-title">WASTE BY REASON</h3>
            <div className="analytics__chart-body analytics__chart-body--pie">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={wasteReasonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="cost"
                    stroke="none"
                  >
                    {wasteReasonData.map((entry, idx) => (
                      <Cell key={idx} fill={wasteColors[idx % wasteColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ display: 'none' }}
                    itemStyle={TOOLTIP_ITEM}
                    wrapperStyle={{ outline: 'none' }}
                    formatter={v => `$${v.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="analytics__pie-legend">
                {wasteReasonData.map((d, i) => (
                  <div key={d.name} className="analytics__legend-item">
                    <span className="analytics__legend-dot" style={{ background: wasteColors[i % wasteColors.length] }} />
                    <span>{d.name}</span>
                    <span className="analytics__legend-val">${d.cost.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Margin by Category */}
          {catBarData.filter(c => c.avgMargin > 0).length > 0 && (
            <div className="analytics__chart-card">
              <h3 className="analytics__chart-title">MARGIN BY CATEGORY</h3>
              <div className="analytics__chart-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={catBarData.filter(c => c.avgMargin > 0)} barGap={4}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#7a7a72', fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fill: '#555', fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL}
                      itemStyle={TOOLTIP_ITEM}
                      wrapperStyle={{ outline: 'none' }}
                      formatter={v => `${v}%`}
                    />
                    <Bar dataKey="avgMargin" name="Avg Margin" radius={[2, 2, 0, 0]}>
                      {catBarData.filter(c => c.avgMargin > 0).map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reorder Priority */}
      {reorderList.length > 0 && (
        <div className="analytics__section">
          <h3 className="analytics__chart-title">REORDER PRIORITY</h3>
          <div className="analytics__reorder-list">
            {reorderList.map((item, i) => (
              <div key={item.sku} className="analytics__reorder-item">
                <span className="analytics__reorder-rank">{i + 1}</span>
                <div className="analytics__reorder-info">
                  <span className="analytics__reorder-name">{item.name}</span>
                  <span className="analytics__reorder-sku">{item.sku} · {item.category} · {item.location}</span>
                </div>
                <div className="analytics__reorder-nums">
                  <span className="analytics__reorder-qty">{item.qty} / {item.reorder}</span>
                  <span className="analytics__reorder-deficit">need +{item.deficit}</span>
                  {item.reorderCost > 0 && (
                    <span className="analytics__reorder-cost">≈ ${item.reorderCost.toFixed(2)}</span>
                  )}
                </div>
                <div className="analytics__reorder-bar">
                  <div
                    className="analytics__reorder-bar-fill"
                    style={{
                      width: `${Math.max((item.qty / item.reorder) * 100, 2)}%`,
                      background: item.qty === 0 ? '#ff4444' : 'var(--orange)',
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
