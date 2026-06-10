import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { formatCurrency, formatDateTime, statusLabel } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';

function StatCard({ label, value, sub, onClick, color = 'brand' }) {
  const colorMap = {
    brand: 'border-brand/20 bg-brand/5',
    green: 'border-green-200 bg-green-50',
    amber: 'border-amber-200 bg-amber-50',
    blue: 'border-blue-200 bg-blue-50',
  };
  return (
    <div
      className={`card border-2 ${colorMap[color]} ${onClick ? 'cursor-pointer hover:shadow-card-hover' : ''} transition-shadow`}
      onClick={onClick}
    >
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
    PICKED: 'badge-picked', CANCELLED: 'badge-cancelled',
  };
  return <span className={classes[status] || 'badge bg-gray-100 text-gray-600'}>{statusLabel(status)}</span>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMissed, setShowMissed] = useState(false);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  async function loadData() {
    try {
      const [statsRes, feedRes] = await Promise.all([
        api.get('/admin/orders/stats'),
        api.get('/admin/orders/feed'),
      ]);
      setStats(statsRes.data);
      setFeed(feedRes.data.orders || []);
    } catch {}
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
    pollRef.current = setInterval(loadData, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-gray-900">Operations Dashboard</h2>
        <button className="btn-secondary text-sm" onClick={() => navigate('/admin/picking-sheet')}>
          Generate Picking Sheet
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Orders Today"
          value={stats?.ordersToday ?? 0}
          color="brand"
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          label="Revenue Today"
          value={formatCurrency(stats?.revenueToday ?? 0)}
          color="green"
        />
        <StatCard
          label="Not Ordered Yet"
          value={stats?.notOrderedToday ?? 0}
          sub="active customers"
          color="amber"
          onClick={() => setShowMissed(!showMissed)}
        />
        <StatCard
          label="Active Customers"
          value={stats?.activeCustomers ?? 0}
          color="blue"
          onClick={() => navigate('/admin/customers')}
        />
      </div>

      {showMissed && stats?.notOrderedCustomers?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">
            Customers who haven't ordered today ({stats.notOrderedCustomers.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.notOrderedCustomers.map((c) => (
              <div key={c.customerId} className="flex items-center justify-between p-3 bg-amber-50 rounded-btn">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.businessName}</p>
                  <p className="text-xs text-gray-500">{c.contactName}</p>
                </div>
                <span className="text-sm text-brand font-medium">{c.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Live Order Feed</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Updates every 30s</span>
          </div>
        </div>

        {feed.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No orders today yet</p>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden space-y-2">
              {feed.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-btn cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/admin/orders')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-gray-500">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{order.businessName}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(order.submittedAt)} · {order.itemCount} items</p>
                  </div>
                  <p className="text-sm font-bold text-brand flex-shrink-0 ml-3">{formatCurrency(order.totalValue)}</p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500 font-medium">Order</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Customer</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Time</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Items</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Value</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/orders?id=${order.id}`)}
                    >
                      <td className="py-2.5 font-mono text-xs">{order.orderNumber}</td>
                      <td className="py-2.5">
                        <p className="font-medium text-gray-900">{order.businessName}</p>
                        <p className="text-xs text-gray-400">{order.contactName}</p>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">{formatDateTime(order.submittedAt)}</td>
                      <td className="py-2.5 text-center">{order.itemCount}</td>
                      <td className="py-2.5 text-right font-semibold">{formatCurrency(order.totalValue)}</td>
                      <td className="py-2.5 text-center"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
