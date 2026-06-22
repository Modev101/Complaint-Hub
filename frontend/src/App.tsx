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

axios.defaults.withCredentials = true;

// Only renders its children if NO seller is logged in.
function RequireGuest({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Only renders its children if a seller IS logged in.
function RequireSeller({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { setUser, authChecked } = useAuth();

  // Wait for the /me check before rendering route-guarded pages,
  // otherwise every visitor briefly gets treated as logged out.
  if (!authChecked) {
    return null; // or a spinner/skeleton if you'd like one
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
              <Register setUser={setUser} />
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
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
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
