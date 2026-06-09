import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatCurrency, formatDateTime, formatDeliveryDate, statusLabel } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';
import Pagination from '../shared/Pagination';
import { DocumentIcon, SearchIcon } from '../shared/Icons';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const classes = {
    PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
    PICKED: 'badge-picked', CANCELLED: 'badge-cancelled',
  };
  return <span className={classes[status] || 'badge bg-gray-100 text-gray-600'}>{statusLabel(status)}</span>;
}

const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKED', 'CANCELLED'],
  PICKED: [],
  CANCELLED: [],
};

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    if (!newStatus) return;
    setSaving(true);
    try {
      await onStatusChange(order.id, newStatus, adminNotes);
      toast.success('Order status updated');
      onClose();
    } catch {
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  const transitions = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="font-display text-xl">{order.orderNumber}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {order.customer?.businessName} · {formatDateTime(order.submittedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{order.customer?.businessName}</p>
              <p className="text-gray-500">{order.customer?.contactName}</p>
              <p className="text-gray-500">{order.customer?.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Delivery</p>
              <p className="font-medium">{formatDeliveryDate(order.deliveryDate)}</p>
              <p className="text-gray-500 mt-2">Total</p>
              <p className="font-bold text-xl text-brand">{formatCurrency(order.totalValue)}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                <th className="text-center py-2 text-gray-500 font-medium">Qty</th>
                <th className="text-right py-2 text-gray-500 font-medium">Unit</th>
                <th className="text-right py-2 text-gray-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-2">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.productCode}</p>
                  </td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {order.notes && (
            <div className="p-3 bg-gray-50 rounded-btn mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Customer Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}

          {transitions.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
              <div className="flex gap-2 mb-3">
                {transitions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`px-4 py-2 rounded-btn text-sm font-medium border transition-colors ${
                      newStatus === s ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand'
                    }`}
                  >
                    Mark as {statusLabel(s)}
                  </button>
                ))}
              </div>
              <textarea
                className="input h-20 resize-none text-sm"
                placeholder="Admin notes (optional)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Close</button>
          {transitions.length > 0 && (
            <button
              className="btn-primary flex-1"
              onClick={handleUpdate}
              disabled={!newStatus || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.orders || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, search, statusFilter]);

  async function handleStatusChange(id, status, adminNotes) {
    await api.patch(`/admin/orders/${id}/status`, { status, adminNotes });
    await load();
  }

  async function openOrder(order) {
    const res = await api.get(`/admin/orders/${order.id}`);
    setSelected(res.data.order);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="font-display text-2xl text-gray-900 mb-6">Order Management</h2>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search by order number or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input sm:w-48"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {['PENDING', 'CONFIRMED', 'PICKED', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState icon={<DocumentIcon className="w-16 h-16" />} title="No orders found" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {['Order #', 'Customer', 'Submitted', 'Items', 'Value', 'Status', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium first:pl-0 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 first:pl-0 font-mono text-xs">{order.orderNumber}</td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-900">{order.customer?.businessName}</p>
                      <p className="text-xs text-gray-400">{order.customer?.contactName}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(order.submittedAt)}</td>
                    <td className="py-3 px-3 text-center">{order.items?.length}</td>
                    <td className="py-3 px-3 text-right font-semibold">{formatCurrency(order.totalValue)}</td>
                    <td className="py-3 px-3"><span className={`badge ${order.status === 'PENDING' ? 'badge-pending' : order.status === 'CONFIRMED' ? 'badge-confirmed' : order.status === 'PICKED' ? 'badge-picked' : 'badge-cancelled'}`}>{statusLabel(order.status)}</span></td>
                    <td className="py-3 pr-0">
                      <button className="btn-ghost text-xs px-2 py-1" onClick={() => openOrder(order)}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
