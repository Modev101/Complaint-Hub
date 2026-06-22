import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.ts";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("cookies:", req.cookies);

  const token = req.cookies?.token;

  console.log("token:", token);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
