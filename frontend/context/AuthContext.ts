import { createContext, type Dispatch, type SetStateAction } from "react";

import type { AuthResponse } from "../src/types";

type Admin = {
  id: string;
  email: string;
};

export type AuthContextValue = {
  user: AuthResponse | null;
  admin: Admin | null;
  authChecked: boolean;
  userCode: string | null;

  setUser: Dispatch<SetStateAction<AuthResponse | null>>;
  setAdmin: Dispatch<SetStateAction<Admin | null>>;
  setUserCode: Dispatch<SetStateAction<string | null>>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
