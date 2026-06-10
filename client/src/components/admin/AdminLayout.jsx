import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import SessionTimeoutModal from '../shared/SessionTimeoutModal';
import {
  HomeIcon, DocumentIcon, UsersIcon, TagIcon, ChartBarIcon, ShieldIcon, PrinterIcon, XIcon
} from '../shared/Icons';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true },
  { to: '/admin/orders', label: 'Orders', icon: DocumentIcon },
  { to: '/admin/picking-sheet', label: 'Picking Sheet', icon: PrinterIcon },
  { to: '/admin/customers', label: 'Customers', icon: UsersIcon },
  { to: '/admin/products', label: 'Products', icon: TagIcon },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/admin/audit', label: 'Audit Log', icon: ShieldIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTimeout = async () => {
    toast.error('Session expired. Please log in again.');
    await logout();
    navigate('/login');
  };

  const { showWarning, remaining, extendSession } = useSessionTimeout(handleTimeout);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showWarning && <SessionTimeoutModal remaining={remaining} onExtend={extendSession} />}

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20">
        <div className="p-6 border-b bg-brand">
          <h1 className="font-display text-xl text-white">Gaytons Bakery</h1>
          <p className="text-xs text-white/60 mt-0.5">Admin Portal</p>
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <p className="text-xs font-medium text-gray-900">{user?.contactName}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <button onClick={handleLogout} className="mt-3 text-xs text-gray-400 hover:text-gray-700">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <button className="lg:hidden btn-ghost p-2" onClick={() => setMobileMenuOpen(true)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-brand">
              <h2 className="font-display text-lg text-white">Admin</h2>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close">
                <XIcon className="w-6 h-6 text-white/80" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-btn text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="text-sm text-brand font-medium">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
