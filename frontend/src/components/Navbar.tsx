import type { AuthResponse } from "../types/index.ts";
import axios from "axios";
import type { Dispatch, SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({
  user,
  setUser,
}: {
  user: AuthResponse | null;
  setUser: Dispatch<SetStateAction<AuthResponse | null>>;
}) {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const handleLogout = async () => {
    await axios.post(`${apiUrl}/api/auth/logout`);
    setUser(null);
    navigate("/");
  };
  const userRole = user?.user?.role;
  const link = `/user/${userRole?.toLowerCase()}`;
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto flex flex-col md:flex-row lg:flex-row items-center justify-between px-6 py-4">
        <Link to="/">
          <p className="text-2xl font-bold text-red-600">ComplaintHub</p>
        </Link>

        {user ? (
          <>
            <div className="mt-4 lg:mt-0 md:mt-0 flex items-center space-x-4">
              <Link to={link} className="animate-text italic font-medium">
                {user?.user?.role}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 font-medium text-white px-3 py-1 rounded cursor-pointer"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 lg:mt-0 md:mt-0 flex items-center gap-4">
              <Link
                to="/login"
                className="rounded-lg border border-red-600 px-5 py-2 font-medium text-red-600 transition hover:bg-red-50"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
