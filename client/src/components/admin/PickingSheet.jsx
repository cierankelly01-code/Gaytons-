import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatCurrency, categoryLabel, formatDeliveryDate } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import { PrinterIcon } from '../shared/Icons';
import { format } from 'date-fns';

const CATEGORY_ORDER = [
  'BREADS_WHITE', 'BREADS_BROWN', 'BREADS_MALTED', 'BREADS_SOURDOUGH',
  'ROLLS_BATCHES', 'ROLLS_BURGERS', 'ROLLS_SUBS',
  'CAKES_INDIVIDUAL', 'CAKES_TRAYBAKE', 'CAKES_CATERER',
  'PASTRIES_SWEET', 'PASTRIES_SAVOURY', 'PIES', 'SCONES_TEACAKES',
];

export default function PickingSheet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    load();
  }, [date]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/picking-sheet?date=${date}`);
      setData(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  const sortedCategories = data
    ? CATEGORY_ORDER.filter((cat) => data.byCategory[cat])
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 no-print">
        <h2 className="font-display text-2xl text-gray-900">Picking Sheet</h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="input w-44"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => window.print()}
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : !data ? null : (
        <div className="print-page">
          <div className="text-center mb-8 print-only">
            <h1 className="font-display text-3xl text-gray-900">GAYTONS BAKERY</h1>
            <p className="text-gray-500">PICKING SHEET — {format(new Date(date), 'd MMMM yyyy')}</p>
          </div>

          <div className="card mb-6 no-print">
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-gray-500">Delivery Date</p>
                <p className="font-bold text-lg">{format(new Date(date), 'd MMMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Orders</p>
                <p className="font-bold text-lg">{data.totalOrders}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Products</p>
                <p className="font-bold text-lg">
                  {Object.values(data.byCategory).flat().length}
                </p>
              </div>
            </div>
          </div>

          {data.totalOrders === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              No confirmed orders for this date.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCategories.map((cat) => {
                const products = data.byCategory[cat];
                if (!products?.length) return null;
                return (
                  <div key={cat} className="card">
                    <h3 className="font-display text-lg text-brand border-b border-gray-200 pb-2 mb-3">
                      {categoryLabel(cat)}
                    </h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-3 text-gray-600 font-medium">Product</th>
                          <th className="text-left py-2 px-3 text-gray-600 font-medium">Code</th>
                          <th className="text-center py-2 px-3 text-gray-600 font-medium text-lg">QTY</th>
                          <th className="text-left py-2 px-3 text-gray-600 font-medium">Customers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((item) => (
                          <tr key={item.productId} className="border-b border-gray-100">
                            <td className="py-3 px-3 font-medium text-gray-900">{item.productName}</td>
                            <td className="py-3 px-3 font-mono text-xs text-gray-500">{item.productCode}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="text-xl font-bold text-brand">{item.totalQuantity}</span>
                            </td>
                            <td className="py-3 px-3 text-xs text-gray-500">
                              {item.customers.map((c) => `${c.businessName} (${c.quantity})`).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
