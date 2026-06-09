import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBasket } from '../../context/BasketContext';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import SessionTimeoutModal from '../shared/SessionTimeoutModal';
import CountdownTimer from '../shared/CountdownTimer';
import Basket from './Basket';
import {
  HomeIcon, ShoppingCartIcon, DocumentIcon, StarIcon, ChartBarIcon, UserIcon, XIcon, BagIcon,
} from '../shared/Icons';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, exact: true },
  { to: '/catalogue', label: 'Order', icon: ShoppingCartIcon },
  { to: '/orders', label: 'Order History', icon: DocumentIcon },
  { to: '/templates', label: 'Templates', icon: StarIcon },
  { to: '/spend', label: 'My Spend', icon: ChartBarIcon },
  { to: '/account', label: 'Account', icon: UserIcon },
];

const MOBILE_TABS = [
  { to: '/', label: 'Home', icon: HomeIcon, exact: true },
  { to: '/catalogue', label: 'Order', icon: ShoppingCartIcon },
  { action: 'basket', label: 'Basket', icon: BagIcon },
  { to: '/account', label: 'Account', icon: UserIcon },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { itemCount } = useBasket();
  const navigate = useNavigate();
  const [basketOpen, setBasketOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTimeout = async () => {
    toast.error('Session expired. Please log in again.');
    await logout();
    navigate('/login');
  };

  const { showWarning, remaining, extendSession } = useSessionTimeout(handleTimeout);

  useEffect(() => {
    const handler = () => setBasketOpen(true);
    window.addEventListener('basket:open', handler);
    return () => window.removeEventListener('basket:open', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {showWarning && (
        <SessionTimeoutModal remaining={remaining} onExtend={extendSession} />
      )}

      {/* Desktop Sidebar — lg+ only */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-display text-xl text-brand">Gaytons Bakery</h1>
          <p className="text-xs text-gray-400 mt-0.5">Trade Portal</p>
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

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-900 truncate">{user?.businessName}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-gray-400 hover:text-gray-700 transition-colors w-full text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Sticky top header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Hamburger: shown on mobile+tablet (lg:hidden) */}
            <button
              className="lg:hidden btn-ghost flex items-center justify-center min-h-[44px] min-w-[44px]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 min-w-0 flex justify-center lg:justify-start">
              <CountdownTimer />
            </div>

            {/* Basket button: hidden on mobile (bottom tab bar handles it), visible on md+ */}
            <button
              className="relative p-2 rounded-btn bg-brand text-white hover:bg-brand-light transition-colors hidden md:flex items-center justify-center"
              onClick={() => setBasketOpen(true)}
              aria-label={`Open basket (${itemCount} items)`}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content
            pb-[76px] on mobile: 56px tab bar + 20px breathing room
            md:pb-4 and lg:pb-6 restore normal padding on larger screens */}
        <main className="flex-1 p-4 lg:p-6 pb-[76px] md:pb-4 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Basket drawer / bottom sheet */}
      <Basket open={basketOpen} onClose={() => setBasketOpen(false)} />

      {/* Hamburger slide-in menu (mobile + tablet) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-display text-lg text-brand">Gaytons Bakery</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <XIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
              <p className="text-sm font-medium text-gray-900">{user?.businessName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <button onClick={handleLogout} className="mt-3 text-sm text-brand font-medium">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar — hidden on md+ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {MOBILE_TABS.map((tab) => {
          if (tab.action === 'basket') {
            return (
              <button
                key="basket"
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[3.5rem]"
                onClick={() => setBasketOpen(true)}
                aria-label={`Open basket${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
              >
                <span className="relative">
                  <BagIcon className={`w-5 h-5 ${itemCount > 0 ? 'text-brand' : 'text-gray-400'}`} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-medium ${itemCount > 0 ? 'text-brand' : 'text-gray-400'}`}>
                  Basket
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.exact}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[3.5rem]"
            >
              {({ isActive }) => (
                <>
                  <tab.icon className={`w-5 h-5 ${isActive ? 'text-brand' : 'text-gray-400'}`} />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-brand' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
