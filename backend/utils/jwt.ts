import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth.ts";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = (payload: AuthUser) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
};
