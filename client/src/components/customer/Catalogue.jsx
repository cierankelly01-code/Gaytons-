import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBasket } from '../../context/BasketContext';
import api from '../../api/client';
import { formatCurrency, categoryLabel } from '../../utils/formatters';
import { SearchIcon, PlusIcon, MinusIcon } from '../shared/Icons';
import { PageLoader } from '../shared/LoadingSpinner';

function ProductRow({ product, quantity, onIncrement, onDecrement }) {
  const hasQty = quantity > 0;

  return (
    <div
      className={`flex items-center gap-2 py-2.5 border-b border-[#EAE0D5] last:border-0 ${
        hasQty ? 'border-l-2 border-l-accent pl-2' : ''
      } ${!product.isAvailable ? 'opacity-40' : ''}`}
    >
      {/* Name + price — flex-1 min-w-0 guarantees truncation without overflowing */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug truncate ${
            hasQty ? 'font-semibold text-brand' : 'text-gray-800'
          }`}
        >
          {product.productName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(product.price)}</p>
      </div>

      {/* Controls — flex-shrink-0 keeps buttons always on-screen */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {hasQty ? (
          <>
            <button
              className="w-9 h-9 flex items-center justify-center rounded border border-[#EAE0D5] bg-white hover:bg-[#F5EDE0] text-gray-700 transition-colors touch-manipulation"
              onClick={() => onDecrement(product.id)}
              aria-label="Remove one"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-brand tabular-nums select-none">
              {quantity}
            </span>
            <button
              className="w-9 h-9 flex items-center justify-center rounded bg-brand text-white hover:bg-brand-light transition-colors touch-manipulation"
              onClick={() => onIncrement(product.id)}
              aria-label="Add one more"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            disabled={!product.isAvailable}
            onClick={() => onIncrement(product.id)}
            className="w-9 h-9 flex items-center justify-center rounded bg-brand text-white hover:bg-brand-light transition-colors touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Add ${product.productName}`}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
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
  const { items, increment, decrement, itemCount, totalItems } = useBasket();

  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/products/categories')])
      .then(([productsRes, catsRes]) => {
        setAllProducts(productsRes.data.products || []);
        const cats = catsRes.data.categories || [];
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].value);
      })
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
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
        if (visible.length > 0) setActiveCategory(visible[0].target.dataset.category);
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
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            className="w-full pl-9 pr-9 py-2.5 rounded-card border border-[#EAE0D5] bg-[#FFFDF9] text-sm focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/15 placeholder-gray-400 transition-all"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Mobile category pills — overflow-x-auto scroll container, no negative margins */}
        {!isSearching && categories.length > 0 && (
          <div className="md:hidden mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2" style={{ width: 'max-content' }}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => scrollToCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap touch-manipulation ${
                    activeCategory === cat.value
                      ? 'bg-brand text-white'
                      : 'bg-white border border-[#EAE0D5] text-gray-600'
                  }`}
                >
                  {cat.label || categoryLabel(cat.value)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tablet: sidebar toggle */}
        {!isSearching && (
          <div className="hidden md:flex lg:hidden mt-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand px-3 py-2 rounded-btn border border-[#EAE0D5] bg-white transition-colors"
            >
              <span>{sidebarCollapsed ? '▶' : '◀'}</span>
              <span>{sidebarCollapsed ? 'Show categories' : 'Hide categories'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isSearching ? (
        filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results for &ldquo;{search}&rdquo;</p>
            <button className="mt-3 text-sm text-brand hover:underline" onClick={() => setSearch('')}>
              Clear search
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            <div className="bg-white rounded-card border border-[#EAE0D5] px-3">
              {filteredProducts.map((product) => (
                <ProductRow
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
        <div className="flex gap-5">
          {/* Sidebar — hidden on mobile, visible on tablet+ */}
          <aside
            className={`flex-shrink-0 w-36 ${
              sidebarCollapsed ? 'hidden lg:block' : 'hidden md:block'
            }`}
          >
            <nav className="sticky top-[76px] space-y-0.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                Categories
              </p>
              {categories.map((cat) => {
                const count = grouped[cat.value]?.length || 0;
                const hasInBasket = (grouped[cat.value] || []).some((p) => items[p.id] > 0);
                return (
                  <button
                    key={cat.value}
                    onClick={() => scrollToCategory(cat.value)}
                    className={`w-full text-left px-2.5 py-2 rounded-btn text-xs transition-colors flex items-center justify-between gap-1 ${
                      activeCategory === cat.value
                        ? 'bg-brand/10 text-brand font-semibold'
                        : 'text-gray-600 hover:bg-[#F5EDE0] hover:text-gray-800'
                    } ${count === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                  >
                    <span className="truncate">{cat.label || categoryLabel(cat.value)}</span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      {hasInBasket && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                      <span className="text-[10px] text-gray-400">{count}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Product sections — min-w-0 prevents flex child from overflowing */}
          <div className="flex-1 min-w-0">
            {visibleCategories.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No products available.</p>
            ) : (
              visibleCategories.map((cat) => (
                <section
                  key={cat.value}
                  ref={(el) => { sectionRefs.current[cat.value] = el; }}
                  data-category={cat.value}
                  className="mb-6 scroll-mt-20"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    {cat.label || categoryLabel(cat.value)}
                    <span className="font-normal text-gray-400">
                      ({grouped[cat.value]?.length || 0})
                    </span>
                  </h3>
                  <div className="bg-white rounded-card border border-[#EAE0D5] px-3">
                    {(grouped[cat.value] || []).map((product) => (
                      <ProductRow
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

      {/* Floating basket bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-[76px] md:bottom-4 left-4 right-4 lg:left-[280px] lg:right-6 z-20 pointer-events-none">
          <button
            className="pointer-events-auto w-full flex items-center justify-between bg-brand text-white rounded-card px-5 py-3 shadow-[0_8px_32px_rgba(139,69,19,0.35)] hover:bg-brand-light transition-colors"
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
              <span className="font-bold">{formatCurrency(basketTotal)}</span>
              <span className="text-sm text-white/80">View Basket →</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
