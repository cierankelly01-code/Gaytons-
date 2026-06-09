import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import { format } from 'date-fns';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topProducts, setTopProducts] = useState(null);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/overview'),
      api.get('/admin/analytics/top-products'),
    ]).then(([ovRes, tpRes]) => {
      setOverview(ovRes.data);
      setTopProducts(tpRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get(`/admin/analytics/spend-leaderboard?period=${period}`).then((res) => {
      setLeaderboard(res.data.leaderboard || []);
    });
  }, [period]);

  if (loading) return <PageLoader />;

  const weeklyData = (overview?.weeklyRevenue || []).map((w) => ({
    name: format(new Date(w.weekStart), 'd MMM'),
    total: w.total,
    orders: w.orders,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="font-display text-2xl text-gray-900">Analytics</h2>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Revenue (Last 12 Weeks)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tickFormatter={(v) => `£${v}`} tick={{ fontSize: 11, fill: '#6B7280' }} width={60} />
            <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '6px', fontSize: '13px' }} />
            <Bar dataKey="total" fill="#8B4513" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topProducts?.topByQuantity && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Top 10 by Quantity (30 days)</h3>
            <div className="space-y-2">
              {topProducts.topByQuantity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.productName}</p>
                  </div>
                  <span className="text-sm font-bold text-brand">{item.totalQuantity} units</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topProducts?.topByRevenue && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Top 10 by Revenue (30 days)</h3>
            <div className="space-y-2">
              {topProducts.topByRevenue.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.productName}</p>
                  </div>
                  <span className="text-sm font-bold text-brand">{formatCurrency(item.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Customer Spend Leaderboard</h3>
          <div className="flex gap-2">
            {['all', 'month', 'week'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs rounded-btn font-medium transition-colors ${
                  period === p ? 'bg-brand text-white' : 'border border-gray-200 text-gray-600'
                }`}
              >
                {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Week'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500 font-medium">#</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Customer</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Total Spend</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Orders</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Avg Order</th>
                <th className="text-right py-2 text-gray-500 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.customerId} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-400 font-mono text-xs">{row.rank}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-gray-900">{row.businessName}</p>
                    <p className="text-xs text-gray-400">{row.contactName}</p>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-brand">{formatCurrency(row.totalSpend)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{row.orderCount}</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(row.avgOrderValue)}</td>
                  <td className="py-2.5 text-right text-gray-400 text-xs">{formatDate(row.lastOrderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No data</p>}
        </div>
      </div>
    </div>
  );
}
