import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatCurrency, categoryLabel } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import { SearchIcon } from '../shared/Icons';
import toast from 'react-hot-toast';

function PriceEditCell({ product, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.price));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const price = parseFloat(value);
    if (isNaN(price) || price <= 0) return;
    setSaving(true);
    try {
      await onSave(product.id, price);
      setEditing(false);
    } finally { setSaving(false); }
  }

  if (!editing) {
    return (
      <button
        className="text-sm font-medium hover:text-brand transition-colors"
        onClick={() => setEditing(true)}
      >
        {formatCurrency(product.price)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-500">£</span>
      <input
        type="number"
        step="0.01"
        min="0.01"
        className="w-20 border border-brand rounded px-2 py-1 text-sm focus:outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <button className="text-xs text-brand font-medium" onClick={handleSave} disabled={saving}>✓</button>
      <button className="text-xs text-gray-400" onClick={() => setEditing(false)}>✕</button>
    </div>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [csvDiff, setCsvDiff] = useState(null);
  const [applyingBulk, setApplyingBulk] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (availFilter) params.set('available', availFilter);
      const res = await api.get(`/admin/products?${params}`);
      setProducts(res.data.products || []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [search, categoryFilter, availFilter]);

  async function toggleAvailability(id, isAvailable) {
    try {
      await api.patch(`/admin/products/${id}/availability`, { isAvailable: !isAvailable });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isAvailable: !isAvailable } : p));
      toast.success(isAvailable ? 'Product marked unavailable' : 'Product marked available');
    } catch { toast.error('Failed to update'); }
  }

  async function updatePrice(id, price) {
    await api.patch(`/admin/products/${id}/price`, { price });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, price } : p));
    toast.success('Price updated');
  }

  function parseCsv(text) {
    const lines = text.trim().split('\n');
    const updates = [];
    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length < 3) continue;
      const code = parts[0].trim();
      const price = parseFloat(parts[parts.length - 1].trim());
      if (code && !isNaN(price)) updates.push({ productCode: code, price });
    }
    return updates;
  }

  function handleCsvPreview() {
    if (!csvContent.trim()) return;
    const updates = parseCsv(csvContent);
    const productMap = Object.fromEntries(products.map((p) => [p.productCode, p]));
    const changes = updates
      .filter((u) => productMap[u.productCode] && Number(productMap[u.productCode].price) !== u.price)
      .map((u) => ({
        ...u,
        productName: productMap[u.productCode]?.productName,
        oldPrice: Number(productMap[u.productCode]?.price),
      }));
    setCsvDiff({ updates, changes });
  }

  async function handleBulkApply() {
    if (!csvDiff) return;
    setApplyingBulk(true);
    try {
      const res = await api.post('/admin/products/bulk-price-update', { updates: csvDiff.updates });
      toast.success(`Updated ${res.data.updated} prices`);
      setCsvContent('');
      setCsvDiff(null);
      load();
    } catch { toast.error('Bulk update failed'); } finally { setApplyingBulk(false); }
  }

  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="font-display text-2xl text-gray-900">Product Management</h2>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Bulk Price Update (CSV)</h3>
        <p className="text-xs text-gray-500 mb-3">Format: <code className="bg-gray-100 px-1 rounded">code,name,price</code> — one product per line</p>
        <textarea
          className="input h-32 resize-none font-mono text-xs mb-3"
          placeholder="994,COBURG WHITE 800G THICK,2.20&#10;995,BLOOMER WHITE LIGHT 800G DOORSTEP,2.20"
          value={csvContent}
          onChange={(e) => { setCsvContent(e.target.value); setCsvDiff(null); }}
        />
        <button className="btn-secondary text-sm" onClick={handleCsvPreview} disabled={!csvContent.trim()}>
          Preview Changes
        </button>

        {csvDiff && (
          <div className="mt-4">
            {csvDiff.changes.length === 0 ? (
              <p className="text-sm text-gray-500">No price changes detected.</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700 mb-2">{csvDiff.changes.length} price changes:</p>
                <div className="max-h-48 overflow-y-auto border rounded-btn">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Old</th>
                      <th className="text-right p-2">New</th>
                    </tr></thead>
                    <tbody>
                      {csvDiff.changes.map((c) => (
                        <tr key={c.productCode} className="border-b">
                          <td className="p-2">{c.productName} <span className="text-gray-400">({c.productCode})</span></td>
                          <td className="p-2 text-right text-gray-400">{formatCurrency(c.oldPrice)}</td>
                          <td className="p-2 text-right font-medium text-green-700">{formatCurrency(c.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn-primary mt-3 text-sm" onClick={handleBulkApply} disabled={applyingBulk}>
                  {applyingBulk ? 'Applying...' : `Apply ${csvDiff.changes.length} Changes`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-48" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
          </select>
          <select className="input sm:w-40" value={availFilter} onChange={(e) => setAvailFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        {loading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-gray-500 font-medium">Code</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Price</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">Available</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!product.isAvailable ? 'opacity-60' : ''}`}>
                    <td className="py-2.5 font-mono text-xs text-gray-500">{product.productCode}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">{product.productName}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-500">{categoryLabel(product.category)}</td>
                    <td className="py-2.5 px-3">
                      <PriceEditCell product={product} onSave={updatePrice} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggleAvailability(product.id, product.isAvailable)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          product.isAvailable ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={product.isAvailable}
                        aria-label={`Toggle ${product.productName} availability`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                          product.isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p className="text-center py-8 text-gray-400">No products found</p>}
          </div>
        )}
      </div>
    </div>
  );
}
