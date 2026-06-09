import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import { format } from 'date-fns';

export default function SpendDashboard() {
  const [data, setData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/spend/summary'),
      api.get('/spend/top-products'),
    ]).then(([summaryRes, topRes]) => {
      setData(summaryRes.data);
      setTopProducts(topRes.data.topProducts || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const chartData = (data?.weeks || []).map((w) => ({
    name: format(new Date(w.weekStart), 'd MMM'),
    total: w.total,
    orders: w.orderCount,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-display text-2xl text-gray-900">My Spend</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">This Week</p>
          <p className="text-2xl font-bold text-brand">{formatCurrency(data?.thisWeekTotal)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data?.monthTotal)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Weekly</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data?.avgWeekly)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">8-Week Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency((data?.weeks || []).reduce((s, w) => s + w.total, 0))}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Spend (Last 8 Weeks)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tickFormatter={(v) => `£${v}`} tick={{ fontSize: 11, fill: '#6B7280' }} width={55} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Spend']}
              contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}
            />
            <Bar dataKey="total" fill="#8B4513" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {topProducts.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top 5 Products This Month</h3>
          <div className="space-y-3">
            {topProducts.map((item, i) => (
              <div key={item.product?.id || i} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-brand/10 text-brand text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product?.productName}</p>
                  <p className="text-xs text-gray-400">{item.product?.productCode}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {item.totalQuantity} units
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
