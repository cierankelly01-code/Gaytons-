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
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-card shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 sm:p-6 border-b">
          <div>
            <h3 className="font-display text-lg sm:text-xl">{order.orderNumber}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {order.customer?.businessName} · {formatDateTime(order.submittedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 text-2xl rounded-btn hover:bg-gray-100"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Customer</p>
              <p className="font-medium">{order.customer?.businessName}</p>
              <p className="text-gray-500 text-xs">{order.customer?.contactName}</p>
              <p className="text-gray-500 text-xs">{order.customer?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Delivery</p>
              <p className="font-medium">{formatDeliveryDate(order.deliveryDate)}</p>
              <p className="text-xs text-gray-500 mt-2">Total</p>
              <p className="font-bold text-lg sm:text-xl text-brand">{formatCurrency(order.totalValue)}</p>
            </div>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden space-y-2 mb-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-medium leading-snug">{item.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.productCode} · ×{item.quantity} @ {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="text-sm font-semibold flex-shrink-0">{formatCurrency(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <table className="hidden sm:table w-full text-sm mb-4">
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
              <div className="flex flex-wrap gap-2 mb-3">
                {transitions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`px-4 py-2 rounded-btn text-sm font-medium border transition-colors min-h-[44px] ${
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

        <div className="p-4 sm:p-6 border-t flex gap-3">
          <button className="btn-secondary flex-1 min-h-[44px]" onClick={onClose}>Close</button>
          {transitions.length > 0 && (
            <button
              className="btn-primary flex-1 min-h-[44px]"
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
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3 mb-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="card p-4 cursor-pointer hover:shadow-card-hover transition-shadow"
                onClick={() => openOrder(order)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-gray-600 font-medium">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{order.customer?.businessName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.submittedAt)} · {order.items?.length} items</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-brand">{formatCurrency(order.totalValue)}</p>
                    <p className="text-xs text-brand mt-1">View →</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block card overflow-x-auto">
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
                    <td className="py-3 px-3">
                      <StatusBadge status={order.status} />
                    </td>
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
