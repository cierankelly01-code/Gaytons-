import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import CustomerLayout from './components/customer/CustomerLayout';
import Dashboard from './components/customer/Dashboard';
import Catalogue from './components/customer/Catalogue';
import OrderHistory from './components/customer/OrderHistory';
import Templates from './components/customer/Templates';
import SpendDashboard from './components/customer/SpendDashboard';
import AccountSettings from './components/customer/AccountSettings';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import OrderManagement from './components/admin/OrderManagement';
import PickingSheet from './components/admin/PickingSheet';
import CustomerManagement from './components/admin/CustomerManagement';
import ProductManagement from './components/admin/ProductManagement';
import Analytics from './components/admin/Analytics';
import AuditLog from './components/admin/AuditLog';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-body text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace /> : <Login />} />

      <Route element={<ProtectedRoute role="CUSTOMER" />}>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/spend" element={<SpendDashboard />} />
          <Route path="/account" element={<AccountSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/picking-sheet" element={<PickingSheet />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/audit" element={<AuditLog />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/') : '/login'} replace />} />
    </Routes>
  );
}
