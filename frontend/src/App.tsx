import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import Seller from "./pages/Seller";
import Consumer from "./pages/Consumer";
import ComplainDistributor from "./pages/ComplainDistributor";
import ComplainProduct from "./pages/ComplainProduct";
import ComplainSeller from "./pages/ComplainSeller";
import ComplainProducts from "./pages/ComplainProducts";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import type { AuthResponse } from "./types";

axios.defaults.withCredentials = true;



function App() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/me`);

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, [apiUrl]);

  const userRole = user?.user?.role;
  const roleRoutes: Record<string, string> = {
    SELLER: "/user/seller",
    CONSUMER: "/user/consumer",
  };

  const link = userRole ? roleRoutes[userRole] : "/";
  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/login"
          element={
            userRole ? (
              <Navigate to={link} replace />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            userRole ? (
              <Navigate to={link} replace />
            ) : (
              <Register setUser={setUser} />
            )
          }
        />

        <Route
          path="/user/seller"
          element={
            userRole === "SELLER" ? <Seller user={user} /> : <Forbidden />
          }
        />

        <Route
          path="/user/consumer"
          element={
            userRole === "CONSUMER" ? <Consumer user={user} /> : <Forbidden />
          }
        />
        <Route
          path="/user/seller/complaints/product"
          element={<ComplainProduct />}
        />
        <Route
          path="/user/seller/complaints/distributor"
          element={<ComplainDistributor />}
        />
        <Route
          path="/user/consumer/complaints/seller"
          element={<ComplainSeller />}
        />
        <Route
          path="/user/consumer/complaints/product"
          element={<ComplainProducts />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
