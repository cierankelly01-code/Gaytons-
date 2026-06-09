import React, { useState, useEffect } from 'react';
import { useBasket } from '../../context/BasketContext';
import api from '../../api/client';
import { formatCurrency, formatDateTime, formatDeliveryDate, statusLabel } from '../../utils/formatters';
import { RefreshIcon, ChevronRightIcon, DocumentIcon } from '../shared/Icons';
import { PageLoader } from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';
import Pagination from '../shared/Pagination';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const classes = {
    PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
    PICKED: 'badge-picked', CANCELLED: 'badge-cancelled',
  };
  return <span className={classes[status] || 'badge bg-gray-100 text-gray-600'}>{statusLabel(status)}</span>;
}

function OrderDetail({ order, onClose, onReorder }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="font-display text-xl">{order.orderNumber}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={order.status} />
              <span className="text-sm text-gray-500">{formatDateTime(order.submittedAt)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 mb-4">
            Delivery: <strong>{formatDeliveryDate(order.deliveryDate)}</strong>
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                <th className="text-center py-2 text-gray-500 font-medium">Qty</th>
                <th className="text-right py-2 text-gray-500 font-medium">Unit</th>
                <th className="text-right py-2 text-gray-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-2">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.productCode}</p>
                  </td>
                  <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="pt-4 text-right font-bold">Order Total</td>
                <td className="pt-4 text-right text-xl font-bold text-brand">{formatCurrency(order.totalValue)}</td>
              </tr>
            </tfoot>
          </table>

          {order.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-btn">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Close</button>
          <button
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={() => onReorder(order)}
          >
            <RefreshIcon className="w-4 h-4" />
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const { loadItems } = useBasket();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/orders?page=${page}`).then((res) => {
      setOrders(res.data.orders || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  function handleReorder(order) {
    loadItems(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    toast.success('Items loaded into your basket!');
    setSelected(null);
    navigate('/catalogue');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-2xl text-gray-900 mb-6">Order History</h2>

      {selected && (
        <OrderDetail order={selected} onClose={() => setSelected(null)} onReorder={handleReorder} />
      )}

      {loading ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<DocumentIcon className="w-16 h-16" />}
          title="No orders yet"
          description="Your order history will appear here once you've placed your first order."
          action={<a href="/catalogue" className="btn-primary">Browse Catalogue</a>}
        />
      ) : (
        <>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="card p-4 cursor-pointer hover:shadow-card-hover transition-shadow"
                onClick={() => setSelected(order)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(order.submittedAt)} · {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-brand">{formatCurrency(order.totalValue)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs text-brand hover:bg-brand/5 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                      >
                        <RefreshIcon className="w-3 h-3" />
                        Reorder
                      </button>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={pages} total={total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
