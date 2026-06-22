import { createContext, type Dispatch, type SetStateAction } from "react";
import type { AuthResponse } from "../src/types/index";

export type AuthContextValue = {
  user: AuthResponse | null;
  setUser: Dispatch<SetStateAction<AuthResponse | null>>;
  authChecked: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
