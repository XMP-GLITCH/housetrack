import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/layouts/MainLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import PaymentSuccess from './pages/public/PaymentSuccess';
import AuthCallback from './pages/public/AuthCallback';
import SetPassword from './pages/public/SetPassword';
import AdminLogin from './pages/public/AdminLogin';

// Landlord Pages
import LandlordDashboard from './pages/landlord/Dashboard';
import Properties from './pages/landlord/Properties';
import NewProperty from './pages/landlord/NewProperty';
import PropertyDetail from './pages/landlord/PropertyDetail';
import Tenants from './pages/landlord/Tenants';
import NewTenant from './pages/landlord/NewTenant';
import TenantDetail from './pages/landlord/TenantDetail';
import Payments from './pages/landlord/Payments';
import Complaints from './pages/landlord/Complaints';
import Reports from './pages/landlord/Reports';
import Settings from './pages/landlord/Settings';
import Onboarding from './pages/landlord/Onboarding';

// Tenant Pages
import TenantDashboard from './pages/tenant/Dashboard';
import TenantPayments from './pages/tenant/Payments';
import Receipt from './pages/tenant/Receipt';
import TenantComplaints from './pages/tenant/Complaints';
import NewComplaint from './pages/tenant/NewComplaint';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/ht-admin-portal" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Landlord onboarding — no MainLayout shell */}
          <Route path="/landlord/onboarding" element={<ProtectedRoute allowedRoles={['landlord']}><Onboarding /></ProtectedRoute>} />

          {/* Landlord Routes */}
          <Route path="/landlord" element={<ProtectedRoute allowedRoles={['landlord']}><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<LandlordDashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/new" element={<NewProperty />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="tenants/new" element={<NewTenant />} />
            <Route path="tenants/:id" element={<TenantDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Tenant Routes */}
          <Route path="/tenant" element={<ProtectedRoute allowedRoles={['tenant']}><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="payments" element={<TenantPayments />} />
            <Route path="receipts/:paymentId" element={<Receipt />} />
            <Route path="complaints" element={<TenantComplaints />} />
            <Route path="complaints/new" element={<NewComplaint />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
