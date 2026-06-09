import React, { useState, useEffect, useCallback } from 'react';
import { useBasket } from '../../context/BasketContext';
import api from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/formatters';
import { SearchIcon, PlusIcon, MinusIcon } from '../shared/Icons';
import { PageLoader } from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';

function ProductCard({ product, quantity, onIncrement, onDecrement, onSetQuantity }) {
  const hasQuantity = quantity > 0;

  return (
    <div
      className={`bg-white rounded-btn border transition-all duration-150 p-4 ${
        hasQuantity
          ? 'border-accent shadow-card-hover border-l-4 border-l-accent'
          : 'border-gray-200 hover:border-gray-300'
      } ${!product.isAvailable ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold leading-tight ${hasQuantity ? 'text-brand' : 'text-gray-900'}`}>
            {product.productName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{product.productCode}</p>
        </div>
        {!product.isAvailable && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</span>
        <span className="text-xs text-gray-400">per unit</span>
      </div>

      {product.isAvailable && (
        <div className="flex items-center gap-2 mt-3">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-btn border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-40"
            onClick={() => onDecrement(product.id)}
            disabled={!hasQuantity}
            aria-label="Decrease quantity"
          >
            <MinusIcon className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min="0"
            className="flex-1 text-center text-sm font-semibold border border-gray-200 rounded-btn py-1 focus:outline-none focus:border-brand"
            value={quantity || 0}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 0) onSetQuantity(product.id, val);
            }}
            aria-label="Quantity"
          />
          <button
            className="w-8 h-8 flex items-center justify-center rounded-btn border border-brand bg-brand text-white hover:bg-brand-light transition-colors"
            onClick={() => onIncrement(product.id)}
            aria-label="Increase quantity"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {hasQuantity && (
        <p className="text-xs text-accent font-medium mt-2 text-right">
          {formatCurrency(product.price * quantity)} total
        </p>
      )}
    </div>
  );
}

export default function Catalogue() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { items, increment, decrement, setQuantity } = useBasket();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    api.get('/products/categories').then((res) => {
      setCategories(res.data.categories || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'ALL') params.set('category', activeCategory);
    if (debouncedSearch) params.set('search', debouncedSearch);

    api.get(`/products?${params}`).then((res) => {
      setProducts(res.data.products || []);
    }).catch(() => {
      setProducts([]);
    }).finally(() => setLoading(false));
  }, [activeCategory, debouncedSearch]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-gray-900 mb-4">Product Catalogue</h2>

        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            className="input pl-10"
            placeholder="Search products by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-btn text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.value
                  ? 'bg-brand text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 text-xs ${activeCategory === cat.value ? 'text-white/70' : 'text-gray-400'}`}>
                ({cat.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={search ? `No results for "${search}". Try a different search term.` : 'No products in this category.'}
          action={
            search ? (
              <button className="btn-secondary" onClick={() => setSearch('')}>Clear search</button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={items[product.id] || 0}
              onIncrement={increment}
              onDecrement={decrement}
              onSetQuantity={setQuantity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
