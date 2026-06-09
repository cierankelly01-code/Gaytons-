import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasket } from '../../context/BasketContext';
import { XIcon, TrashIcon, MinusIcon, PlusIcon } from '../shared/Icons';
import { formatCurrency, formatDeliveryDate } from '../../utils/formatters';
import api from '../../api/client';
import toast from 'react-hot-toast';

function ConfirmModal({ order, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="font-display text-xl">Confirm Order</h3>
          <p className="text-sm text-gray-500 mt-1">
            Delivery: <span className="font-medium text-gray-800">{formatDeliveryDate(order?.deliveryDate)}</span>
          </p>
        </div>
        <div className="p-6 max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {order?.items?.map((item) => (
                <tr key={item.productId} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 text-gray-800">{item.productName}</td>
                  <td className="py-2 text-gray-500 text-right">×{item.quantity}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-xl text-brand">{formatCurrency(order?.total)}</span>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={onCancel} disabled={loading}>Cancel</button>
            <button className="btn-primary flex-1" onClick={onConfirm} disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Basket({ open, onClose }) {
  const { items, notes, setNotes, setQuantity, increment, decrement, clearBasket } = useBasket();
  const [products, setProducts] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const navigate = useNavigate();

  const itemIds = Object.keys(items);

  useEffect(() => {
    if (itemIds.length === 0) return;
    const missingIds = itemIds.filter((id) => !products[id]);
    if (missingIds.length === 0) return;

    api.get('/products').then((res) => {
      const map = {};
      res.data.products.forEach((p) => { map[p.id] = p; });
      setProducts(map);
    }).catch(() => {});
  }, [JSON.stringify(itemIds)]);

  const basketLines = itemIds
    .filter((id) => products[id])
    .map((id) => ({
      productId: id,
      productName: products[id].productName,
      productCode: products[id].productCode,
      price: products[id].price,
      quantity: items[id],
      lineTotal: products[id].price * items[id],
    }));

  const total = basketLines.reduce((s, l) => s + l.lineTotal, 0);

  function prepareConfirm() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPendingOrder({ items: basketLines, total, deliveryDate: tomorrow });
    setShowConfirm(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        items: basketLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        notes,
      };
      const res = await api.post('/orders', payload);
      toast.success(`Order ${res.data.order.orderNumber} submitted!`);
      clearBasket();
      setShowConfirm(false);
      onClose();
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit order';
      toast.error(msg);
      if (err.response?.data?.code === 'CUTOFF_PASSED') {
        setShowConfirm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          order={pendingOrder}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
          loading={submitting}
        />
      )}

      <div className="fixed inset-0 z-30 flex justify-end">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-display text-xl">Your Order</h2>
            <button onClick={onClose} aria-label="Close basket">
              <XIcon className="w-6 h-6 text-gray-400 hover:text-gray-700" />
            </button>
          </div>

          {basketLines.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-6xl mb-4">🧺</div>
                <p className="text-gray-500 text-sm">Your basket is empty.</p>
                <p className="text-gray-400 text-xs mt-1">Browse the catalogue to add items.</p>
                <button className="btn-primary mt-4" onClick={() => { onClose(); navigate('/catalogue'); }}>
                  Browse Catalogue
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {basketLines.map((line) => (
                  <div key={line.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-btn">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{line.productName}</p>
                      <p className="text-xs text-gray-400">{line.productCode} · {formatCurrency(line.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-200 transition-colors"
                        onClick={() => decrement(line.productId)}
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        className="w-10 text-center text-sm font-medium border border-gray-200 rounded py-0.5"
                        value={line.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) setQuantity(line.productId, val);
                        }}
                      />
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-200 transition-colors"
                        onClick={() => increment(line.productId)}
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-sm font-semibold">{formatCurrency(line.lineTotal)}</p>
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() => setQuantity(line.productId, 0)}
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Order notes (optional)</label>
                  <textarea
                    className="input text-sm h-20 resize-none"
                    placeholder="Any special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 text-sm">Order total</span>
                  <span className="text-2xl font-bold text-brand">{formatCurrency(total)}</span>
                </div>
                <button className="btn-primary w-full text-base py-3" onClick={prepareConfirm}>
                  Submit Order
                </button>
                <button
                  className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2 py-1"
                  onClick={() => { clearBasket(); }}
                >
                  Clear basket
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
