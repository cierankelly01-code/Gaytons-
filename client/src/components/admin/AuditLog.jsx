import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDateTime } from '../../utils/formatters';
import { PageLoader } from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import { ShieldIcon } from '../shared/Icons';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ action: '', from: '', to: '' });

  useEffect(() => {
    load();
  }, [page, filters]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.action) params.set('action', filters.action);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const res = await api.get(`/admin/audit-log?${params}`);
      setLogs(res.data.logs || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }

  const actionColor = (action) => {
    if (action.includes('FAIL') || action.includes('LOCK')) return 'text-red-600 bg-red-50';
    if (action.includes('SUCCESS') || action.includes('CREATE')) return 'text-green-700 bg-green-50';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return 'text-blue-700 bg-blue-50';
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'text-amber-700 bg-amber-50';
    return 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldIcon className="w-6 h-6 text-brand" />
        <h2 className="font-display text-2xl text-gray-900">Audit Log</h2>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="Filter by action (e.g. LOGIN)"
            value={filters.action}
            onChange={(e) => { setFilters((p) => ({ ...p, action: e.target.value })); setPage(1); }}
          />
          <input
            type="date"
            className="input sm:w-40"
            value={filters.from}
            onChange={(e) => { setFilters((p) => ({ ...p, from: e.target.value })); setPage(1); }}
          />
          <input
            type="date"
            className="input sm:w-40"
            value={filters.to}
            onChange={(e) => { setFilters((p) => ({ ...p, to: e.target.value })); setPage(1); }}
          />
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {['Timestamp', 'User', 'Action', 'IP Address', 'Details'].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pl-0 px-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{log.user.businessName || log.user.email}</p>
                          <p className="text-xs text-gray-400">{log.user.role}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-medium ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-400 font-mono">{log.ipAddress}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 80) + '...' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <p className="text-center py-8 text-gray-400">No audit entries found</p>}
          </div>
          <Pagination page={page} pages={pages} total={total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
