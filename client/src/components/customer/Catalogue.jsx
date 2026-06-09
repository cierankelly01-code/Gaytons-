import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBasket } from '../../context/BasketContext';
import api from '../../api/client';
import { formatCurrency, categoryLabel } from '../../utils/formatters';
import { SearchIcon, PlusIcon, MinusIcon } from '../shared/Icons';
import { PageLoader } from '../shared/LoadingSpinner';

function ProductCard({ product, quantity, onIncrement, onDecrement }) {
  const hasQty = quantity > 0;

  return (
    <div
      className={`relative rounded-card border transition-all duration-150 p-3 flex flex-col ${
        hasQty
          ? 'bg-[#FFFDF5] border-accent/60 shadow-card-hover'
          : 'bg-[#FFFDF9] border-[#EAE0D5] hover:border-accent/40 shadow-card'
      } ${!product.isAvailable ? 'opacity-50' : ''}`}
    >
      {/* Quantity badge */}
      {hasQty && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center z-10 shadow-sm">
          {quantity}
        </span>
      )}

      {/* Name + code */}
      <div className="flex-1 mb-2.5">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{product.productName}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{product.productCode}</p>
      </div>

      {/* Price + controls */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-brand flex-shrink-0">{formatCurrency(product.price)}</span>

        {product.isAvailable ? (
          hasQty ? (
            /* Inline stepper */
            <div className="flex items-center gap-1">
              <button
                className="w-11 h-11 lg:w-8 lg:h-8 flex items-center justify-center rounded border border-[#EAE0D5] hover:bg-[#F5EDE0] text-gray-600 transition-colors flex-shrink-0"
                onClick={() => onDecrement(product.id)}
                aria-label={`Remove one ${product.productName}`}
              >
                <MinusIcon className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-brand flex-shrink-0">{quantity}</span>
              <button
                className="w-11 h-11 lg:w-8 lg:h-8 flex items-center justify-center rounded bg-brand text-white hover:bg-brand-light transition-colors flex-shrink-0"
                onClick={() => onIncrement(product.id)}
                aria-label={`Add another ${product.productName}`}
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Quick-add button */
            <button
              className="w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded bg-brand text-white hover:bg-brand-light transition-colors flex-shrink-0"
              onClick={() => onIncrement(product.id)}
              aria-label={`Add ${product.productName}`}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          )
        ) : (
          <span className="text-xs text-gray-400 italic">Out of stock</span>
        )}
      </div>
    </div>
  );
}

export default function Catalogue() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { items, increment, decrement, setQuantity, itemCount, totalItems } = useBasket();

  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/products/categories'),
    ]).then(([productsRes, catsRes]) => {
      setAllProducts(productsRes.data.products || []);
      const cats = catsRes.data.categories || [];
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0].value);
    }).catch(() => {
      setAllProducts([]);
    }).finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return allProducts;
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q)
    );
  }, [allProducts, search]);

  const grouped = useMemo(() => {
    const map = {};
    for (const cat of categories) map[cat.value] = [];
    for (const p of filteredProducts) {
      if (map[p.category] !== undefined) map[p.category].push(p);
    }
    return map;
  }, [filteredProducts, categories]);

  const visibleCategories = useMemo(
    () => categories.filter((cat) => grouped[cat.value]?.length > 0),
    [categories, grouped]
  );

  const basketTotal = useMemo(
    () => allProducts.reduce((sum, p) => sum + (items[p.id] || 0) * Number(p.price), 0),
    [allProducts, items]
  );

  useEffect(() => {
    if (categories.length === 0 || search.trim()) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveCategory(visible[0].target.dataset.category);
        }
      },
      { rootMargin: '-5% 0px -70% 0px', threshold: 0 }
    );

    categories.forEach((cat) => {
      const el = sectionRefs.current[cat.value];
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [categories, search, visibleCategories]);

  const scrollToCategory = useCallback((catValue) => {
    const el = sectionRefs.current[catValue];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveCategory(catValue);
    }
  }, []);

  if (loading) return <PageLoader />;

  const isSearching = search.trim().length > 0;

  return (
    <div className="relative pb-24">
      {/* Search bar */}
      <div className="mb-5">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            className="w-full pl-9 pr-9 py-3 md:py-2.5 rounded-card border border-[#EAE0D5] bg-[#FFFDF9] text-sm focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/15 placeholder-gray-400 transition-all"
            placeholder="Search products by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none p-1"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Mobile-only category pills */}
        {!isSearching && categories.length > 0 && (
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => scrollToCategory(cat.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-white border border-[#EAE0D5] text-gray-600 hover:border-accent/50'
                }`}
              >
                {cat.label || categoryLabel(cat.value)}
              </button>
            ))}
          </div>
        )}

        {/* Tablet-only: sidebar collapse toggle (hidden on desktop lg+) */}
        {!isSearching && (
          <div className="hidden md:flex lg:hidden mt-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand px-3 py-2 rounded-btn border border-[#EAE0D5] bg-white transition-colors min-h-[44px]"
            >
              <span className="text-sm leading-none">{sidebarCollapsed ? '▶' : '◀'}</span>
              <span>{sidebarCollapsed ? 'Show categories' : 'Hide categories'}</span>
            </button>
          </div>
        )}
      </div>

      {isSearching ? (
        /* Search results */
        filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-base">No results for &ldquo;{search}&rdquo;</p>
            <button
              className="mt-3 text-sm text-brand hover:underline py-2 min-h-[44px]"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-3">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={items[product.id] || 0}
                  onIncrement={increment}
                  onDecrement={decrement}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="flex gap-6">
          {/*
            Sidebar visibility:
            - Mobile (<md): always hidden — pills used instead
            - Tablet (md–lg): show when not collapsed; collapse toggle above controls it
            - Desktop (lg+): always show regardless of sidebarCollapsed
          */}
          <aside
            className={`flex-shrink-0 w-40 ${
              sidebarCollapsed ? 'hidden lg:block' : 'hidden md:block'
            }`}
          >
            <nav className="sticky top-[76px] space-y-0.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Categories
              </p>
              {categories.map((cat) => {
                const count = grouped[cat.value]?.length || 0;
                const hasInBasket = (grouped[cat.value] || []).some((p) => items[p.id] > 0);
                return (
                  <button
                    key={cat.value}
                    onClick={() => scrollToCategory(cat.value)}
                    className={`w-full text-left px-2.5 py-2 rounded-btn text-xs transition-colors flex items-center justify-between gap-1.5 min-h-[36px] ${
                      activeCategory === cat.value
                        ? 'bg-brand/10 text-brand font-semibold'
                        : 'text-gray-600 hover:bg-[#F5EDE0] hover:text-gray-800'
                    } ${count === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                  >
                    <span className="truncate leading-tight">
                      {cat.label || categoryLabel(cat.value)}
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      {hasInBasket && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                      )}
                      <span className={`text-[10px] ${activeCategory === cat.value ? 'text-brand/50' : 'text-gray-400'}`}>
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Category product sections */}
          <div className="flex-1 min-w-0">
            {visibleCategories.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No products available.</div>
            ) : (
              visibleCategories.map((cat) => (
                <section
                  key={cat.value}
                  ref={(el) => { sectionRefs.current[cat.value] = el; }}
                  data-category={cat.value}
                  className="mb-10 scroll-mt-20"
                >
                  <h3 className="font-display text-lg text-brand mb-3 pb-2 border-b border-[#EAE0D5] flex items-center gap-2">
                    {cat.label || categoryLabel(cat.value)}
                    <span className="text-sm text-gray-400 font-normal font-body">
                      ({grouped[cat.value]?.length || 0})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(grouped[cat.value] || []).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantity={items[product.id] || 0}
                        onIncrement={increment}
                        onDecrement={decrement}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating basket bar
          Mobile: bottom-[76px] clears the tab bar (56px) + gap (20px)
          Tablet+: bottom-4
          Desktop: left-[280px] aligns with main content (256px nav + 24px padding) */}
      {itemCount > 0 && (
        <div className="fixed bottom-[76px] md:bottom-4 left-4 right-4 lg:left-[280px] lg:right-6 z-20 pointer-events-none">
          <button
            className="pointer-events-auto w-full flex items-center justify-between bg-brand text-white rounded-card px-5 py-3.5 shadow-[0_8px_32px_rgba(139,69,19,0.35)] hover:bg-brand-light transition-colors min-h-[52px]"
            onClick={() => window.dispatchEvent(new CustomEvent('basket:open'))}
            aria-label={`View basket: ${totalItems} items, ${formatCurrency(basketTotal)}`}
          >
            <div className="flex items-center gap-3">
              <span className="bg-white/20 rounded px-2 py-0.5 text-sm font-bold">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
              <span className="text-sm text-white/70 hidden sm:inline">
                {itemCount} product{itemCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">{formatCurrency(basketTotal)}</span>
              <span className="text-sm text-white/80">View Basket →</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
