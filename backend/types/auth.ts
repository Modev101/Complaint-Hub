export type Role = "SELLER" | "CONSUMER";

export interface AuthUser {
  id: string;
  role: Role;
}
