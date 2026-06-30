import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import axios from "axios";
import NotFound from "./pages/NotFound";
import ComplainConsumer from "./pages/ComplainConsumer";
import ComplainSeller from "./pages/ComplainSeller";
import { AuthProvider } from "../context/AuthProvider";
import { useAuth } from "../context/useAuth";
import LoginAdmin from "./pages/LoginAdmin";
import Dashboard from "./pages/Dashboard";
import ConsumerDashboardComplaints from "./pages/ConsumerDashboardComplaints";
import SellerDashboardComplaints from "./pages/SellerDashboardComplaints";
import Forbidden from "./pages/Forbidden";
import LoginAnalytics from "./pages/LoginAnalytics";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

axios.defaults.withCredentials = true;

// Guest only
function RequireGuest({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/user/seller/complaints" replace />;
  }

  return <>{children}</>;
}

// Seller only
function RequireSeller({ children }: { children: ReactNode }) {
  const { userCode } = useAuth();

  if (!userCode) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin only
function RequireAdmin({ children }: { children: ReactNode }) {
  const { admin, authChecked } = useAuth();

  if (!authChecked) return null;

  if (!admin) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
// Admin login Redirect
function RedirectAdminDashboard({ children }: { children: ReactNode }) {
  const { admin, authChecked } = useAuth();

  if (!authChecked) return null;

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
// Analytics login Redirect
function RedirectAnalyticsDashboard({ children }: { children: ReactNode }) {
  const { admin, authChecked } = useAuth();

  if (!authChecked) return null;

  if (admin) {
    return <Navigate to="/analytics/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { setUser, authChecked } = useAuth();

  if (!authChecked) {
    return null;
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login setUser={setUser} />
            </RequireGuest>
          }
        />

        <Route
          path="/register"
          element={
            <RequireGuest>
              <Register />
            </RequireGuest>
          }
        />

        <Route
          path="/user/seller/complaints"
          element={
            <RequireSeller>
              <ComplainSeller />
            </RequireSeller>
          }
        />

        <Route
          path="/user/consumer/complaints"
          element={<ComplainConsumer />}
        />

        <Route
          path="/admin/login"
          element={
            <RedirectAdminDashboard>
              <LoginAdmin />
            </RedirectAdminDashboard>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="/analytics/login"
          element={
            <RedirectAnalyticsDashboard>
              <LoginAnalytics />
            </RedirectAnalyticsDashboard>
          }
        />
        <Route
          path="/analytics/dashboard"
          element={
            <RequireAdmin>
              <AnalyticsDashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="/seller/complaints"
          element={<SellerDashboardComplaints />}
        />

        <Route
          path="/consumer/complaints"
          element={<ConsumerDashboardComplaints />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
