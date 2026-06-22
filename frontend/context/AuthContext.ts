import { createContext, type Dispatch, type SetStateAction } from "react";
import type { AuthResponse } from "../src/types/index";

export type AuthContextValue = {
  user: AuthResponse | null;
  setUser: Dispatch<SetStateAction<AuthResponse | null>>;
  authChecked: boolean;
  userCode: string | null; 
  setUserCode: Dispatch<SetStateAction<string | null>>; 
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
