import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import { SearchIcon, LockIcon, UserIcon } from '../shared/Icons';
import toast from 'react-hot-toast';

const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

function CreateCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/admin/customers', form);
      toast.success(`Customer created. Temp password: ${res.data.tempPassword}`);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-display text-xl">New Customer Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-red-700 text-sm">{error}</div>}
          {[
            { name: 'businessName', label: 'Business Name', type: 'text' },
            { name: 'contactName', label: 'Contact Name', type: 'text' },
            { name: 'email', label: 'Email Address', type: 'email' },
            { name: 'phone', label: 'Phone Number', type: 'tel' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              <input
                type={type}
                className="input"
                value={form[name]}
                onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                required
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">A welcome email with login details will be sent automatically.</p>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Creating...' : 'Create & Send Welcome Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerDetailModal({ customer, onClose, onUpdate }) {
  const [editForm, setEditForm] = useState({
    businessName: customer.businessName,
    contactName: customer.contactName,
    phone: customer.phone,
  });
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState('');

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/admin/customers/${customer.id}`, editForm);
      toast.success('Customer updated');
      onUpdate();
      onClose();
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  }

  async function handleAction(type) {
    setAction(type);
    try {
      if (type === 'unlock') await api.patch(`/admin/customers/${customer.id}/unlock`);
      if (type === 'deactivate') await api.patch(`/admin/customers/${customer.id}/deactivate`, { isActive: !customer.isActive });
      if (type === 'reset') {
        const res = await api.post(`/admin/customers/${customer.id}/reset-password`);
        toast.success(`Password reset. Temp: ${res.data.tempPassword}`);
      }
      if (type !== 'reset') toast.success('Done');
      onUpdate();
      onClose();
    } catch { toast.error('Action failed'); } finally { setAction(''); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-display text-xl">{customer.businessName}</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'businessName', label: 'Business Name' },
            { name: 'contactName', label: 'Contact Name' },
            { name: 'phone', label: 'Phone' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              <input
                className="input"
                value={editForm[name]}
                onChange={(e) => setEditForm((p) => ({ ...p, [name]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input className="input bg-gray-50" value={customer.email} disabled />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Account Actions</p>
            <div className="flex flex-wrap gap-2">
              {customer.isLocked && (
                <button
                  className="btn-secondary text-sm py-1.5"
                  onClick={() => handleAction('unlock')}
                  disabled={!!action}
                >
                  🔓 Unlock Account
                </button>
              )}
              <button
                className={`text-sm py-1.5 px-4 rounded-btn border font-semibold ${
                  customer.isActive
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-green-200 text-green-600 hover:bg-green-50'
                }`}
                onClick={() => handleAction('deactivate')}
                disabled={!!action}
              >
                {customer.isActive ? '🚫 Deactivate' : '✓ Activate'}
              </button>
              <button
                className="btn-secondary text-sm py-1.5"
                onClick={() => handleAction('reset')}
                disabled={!!action}
              >
                🔑 Reset Password
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeFilter) params.set('active', activeFilter);
      const res = await api.get(`/admin/customers?${params}`);
      setCustomers(res.data.customers || []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [search, activeFilter]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="font-display text-2xl text-gray-900">Customer Accounts</h2>
        <button className="btn-primary flex-shrink-0 min-h-[44px]" onClick={() => setShowCreate(true)}>+ New Customer</button>
      </div>

      {showCreate && (
        <CreateCustomerModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
      {selected && (
        <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} onUpdate={load} />
      )}

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-40" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="">All Customers</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? <PageLoader /> : customers.length === 0 ? (
        <p className="text-center py-8 text-gray-400">No customers found</p>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="card p-4 cursor-pointer hover:shadow-card-hover transition-shadow"
                onClick={() => setSelected(c)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.businessName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.contactName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{c.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex gap-1 flex-wrap justify-end">
                      {!c.isActive && <span className="badge bg-gray-100 text-gray-500">Inactive</span>}
                      {c.isLocked && <span className="flex items-center gap-0.5 badge bg-red-100 text-red-700"><LockIcon className="w-3 h-3" />Locked</span>}
                      {c.isActive && !c.isLocked && <span className="badge bg-green-100 text-green-700">Active</span>}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.totalSpend)}</span>
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
                  {['Business', 'Contact', 'Email', 'Last Order', 'Total Spend', 'Status', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 first:pl-0 font-medium">{c.businessName}</td>
                    <td className="py-3 px-3 text-gray-600">{c.contactName}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{c.email}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{formatDate(c.lastOrderDate) || '—'}</td>
                    <td className="py-3 px-3 font-semibold">{formatCurrency(c.totalSpend)}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {!c.isActive && <span className="badge bg-gray-100 text-gray-500">Inactive</span>}
                        {c.isLocked && <span className="flex items-center gap-0.5 badge bg-red-100 text-red-700"><LockIcon className="w-3 h-3" />Locked</span>}
                        {c.isActive && !c.isLocked && <span className="badge bg-green-100 text-green-700">Active</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <button className="btn-ghost text-xs py-1" onClick={() => setSelected(c)}>Edit →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
