import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasket } from '../../context/BasketContext';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';
import { StarIcon, TrashIcon, RefreshIcon } from '../shared/Icons';
import { PageLoader } from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';
import toast from 'react-hot-toast';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { loadItems } = useBasket();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.get('/templates').then((res) => {
      setTemplates(res.data.templates || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function handleLoad(template) {
    loadItems(template.items);
    toast.success(`Template "${template.name}" loaded into basket`);
    navigate('/catalogue');
  }

  async function handleDelete(template) {
    if (!confirm(`Delete template "${template.name}"?`)) return;
    setDeleting(template.id);
    try {
      await api.delete(`/templates/${template.id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-gray-900">Order Templates</h2>
      </div>

      <div className="card mb-6 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Templates are saved from your submitted orders. After placing an order, you can save it as a template from the Order History page.
          Load any template to quickly populate your basket with the same items.
        </p>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={<StarIcon className="w-16 h-16" />}
          title="No templates yet"
          description="Save a template from your order history to quickly reorder your regular items."
          action={<a href="/orders" className="btn-primary">View Order History</a>}
        />
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-accent/10 rounded-btn flex items-center justify-center flex-shrink-0">
                    <StarIcon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{template.name}</p>
                    <p className="text-xs text-gray-400">
                      {Array.isArray(template.items) ? template.items.length : 0} items · Saved {formatDate(template.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs"
                    onClick={() => handleLoad(template)}
                  >
                    <RefreshIcon className="w-3.5 h-3.5" />
                    Load
                  </button>
                  <button
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-btn transition-colors"
                    onClick={() => handleDelete(template)}
                    disabled={deleting === template.id}
                    aria-label="Delete template"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
