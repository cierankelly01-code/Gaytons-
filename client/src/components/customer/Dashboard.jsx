import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBasket } from '../../context/BasketContext';
import api from '../../api/client';
import { formatCurrency, formatDate, formatDeliveryDate, statusLabel } from '../../utils/formatters';
import { CheckCircleIcon, RefreshIcon, StarIcon, ShoppingCartIcon } from '../shared/Icons';
import { PageLoader } from '../shared/LoadingSpinner';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const classes = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    PICKED: 'badge-picked',
    CANCELLED: 'badge-cancelled',
  };
  return <span className={classes[status] || 'badge'}>{statusLabel(status)}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { loadItems } = useBasket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    lastOrder: null,
    todayOrder: null,
    thisWeekTotal: 0,
    favourites: [],
  });

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, spendRes, favsRes] = await Promise.all([
          api.get('/orders?page=1'),
          api.get('/spend/summary'),
          api.get('/spend/favourites'),
        ]);

        const orders = ordersRes.data.orders || [];
        const today = new Date().toDateString();
        const todayOrder = orders.find(
          (o) => new Date(o.submittedAt).toDateString() === today && o.status !== 'CANCELLED'
        );
        const lastOrder = orders.find((o) => o.status !== 'CANCELLED') || null;

        setData({
          lastOrder,
          todayOrder,
          thisWeekTotal: spendRes.data.thisWeekTotal || 0,
          favourites: favsRes.data.favourites || [],
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleReorder(order) {
    if (!order?.items?.length) return;
    loadItems(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    toast.success('Items loaded into your basket!');
    navigate('/catalogue');
  }

  function handleAddFavourite(fav) {
    loadItems([{ productId: fav.id, quantity: 1 }]);
    toast.success(`${fav.productName} added to basket`);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-display text-2xl text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.contactName?.split(' ')[0]}
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">{user?.businessName}</p>
      </div>

      {data.todayOrder && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-card">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Order {data.todayOrder.orderNumber} submitted for{' '}
              {formatDeliveryDate(data.todayOrder.deliveryDate)}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              {data.todayOrder.items.length} items · {formatCurrency(data.todayOrder.totalValue)}
              {' · '}<StatusBadge status={data.todayOrder.status} />
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">This Week's Spend</p>
          <p className="text-3xl font-bold text-brand">{formatCurrency(data.thisWeekTotal)}</p>
          <button
            className="text-xs text-brand hover:underline mt-2"
            onClick={() => navigate('/spend')}
          >
            View full spend dashboard →
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Order</p>
            {data.lastOrder && (
              <button
                className="flex items-center gap-1.5 text-xs text-brand hover:bg-brand/5 px-2 py-1 rounded transition-colors"
                onClick={() => handleReorder(data.lastOrder)}
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                Reorder this
              </button>
            )}
          </div>
          {data.lastOrder ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{data.lastOrder.orderNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(data.lastOrder.submittedAt)} · {data.lastOrder.items.length} items ·{' '}
                {formatCurrency(data.lastOrder.totalValue)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No orders yet</p>
          )}
        </div>
      </div>

      {data.favourites.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-gray-900">Your Favourites</h3>
            <span className="text-xs text-gray-400">(most ordered)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.favourites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => handleAddFavourite(fav)}
                className="p-3 border border-gray-200 rounded-btn text-left hover:border-brand hover:bg-brand/5 transition-all group"
              >
                <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 group-hover:text-brand">
                  {fav.productName}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatCurrency(fav.price)}</p>
                <div className="flex items-center gap-1 mt-2 text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                  <ShoppingCartIcon className="w-3 h-3" />
                  <span className="text-xs">Add</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          className="card text-left hover:shadow-card-hover transition-shadow border-2 border-transparent hover:border-brand/20"
          onClick={() => navigate('/catalogue')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-btn flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Place an Order</p>
              <p className="text-xs text-gray-500">Browse all 243 products</p>
            </div>
          </div>
        </button>

        <button
          className="card text-left hover:shadow-card-hover transition-shadow border-2 border-transparent hover:border-brand/20"
          onClick={() => navigate('/templates')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-btn flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Order Templates</p>
              <p className="text-xs text-gray-500">Load a saved order template</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
