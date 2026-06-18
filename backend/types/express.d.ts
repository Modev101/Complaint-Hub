import { AuthUser } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export {};
