import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { AuthResponse } from "../src/types";
import { AuthContext } from "./AuthContext";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Admin = {
  id: string;
  email: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  const [admin, setAdmin] = useState<Admin | null>(null);

  const [userCode, setUserCode] = useState<string | null>(null);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const [userRes, adminRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/api/auth/me`, {
            withCredentials: true,
          }),

          axios.get(`${apiUrl}/api/auth/admin/me`, {
            withCredentials: true,
          }),
        ]);

        if (userRes.status === "fulfilled") {
          setUser(userRes.value.data.user);

          setUserCode(userRes.value.data.user?.code ?? null);
        }

        if (adminRes.status === "fulfilled") {
          setAdmin(adminRes.value.data.admin);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        admin,
        setAdmin,
        userCode,
        setUserCode,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
