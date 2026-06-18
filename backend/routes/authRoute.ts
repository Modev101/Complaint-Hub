import express from "express";
import { hash, compare } from "bcrypt-ts";
import { prisma } from "../lib/prisma.ts";
import { signToken } from "../utils/jwt.ts";
import { authenticateToken } from "../middleware/authToken.ts";
import { authorizeRoles } from "../middleware/authRoles.ts";
import { cookieOptions } from "../config/cookies.ts";
import type { Role } from "../types/auth.ts";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const hashed = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role, // IMPORTANT: never trust frontend role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = signToken({ id: user.id, role: user.role as Role });

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const ok = await compare(password, user.password);

  if (!ok) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = signToken({ id: user.id, role: user.role as Role });

  res.cookie("token", token, cookieOptions);

  return res.status(200).json({ user: safeUser });
});

router.get(
  "/seller",
  authenticateToken,
  authorizeRoles("SELLER"),
  (req, res) => {
    res.json({ user: req.user });
  },
);

router.get(
  "/consumer",
  authenticateToken,
  authorizeRoles("CONSUMER"),
  (req, res) => {
    res.json({ user: req.user });
  },
);

router.get("/me", authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return res.json({ user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logged out" });
});

export default router;
