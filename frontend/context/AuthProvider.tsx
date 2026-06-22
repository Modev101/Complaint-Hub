import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { AuthResponse } from "../src/types/index";
import { AuthContext } from "./AuthContext";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null); // ← add this

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/me`);
        setUser(response.data.user);
        setUserCode(response.data.user.code ?? null); // ← restore code if already logged in
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setUserCode(null);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, authChecked, userCode, setUserCode }}
    >
      {children}
    </AuthContext.Provider>
  );
}
