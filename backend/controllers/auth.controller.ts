import { Request, Response } from "express";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.ts";
import { signToken } from "../utils/jwt.ts";
import { cookieOptions } from "../config/cookies.ts";

function generateCode(length: number = 7): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => letters[b % letters.length])
    .join("");
}

const normalizeToArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
};

function handleError(res: Response, label: string, error: unknown) {
  console.error(`${label} Error:`, error);
  return res.status(500).json({ message: "Internal server error" });
}

export async function register(req: Request, res: Response) {
  try {
    const { storeName, phoneNumber, state, county, town, platform } = req.body;

    if (
      !storeName?.trim() ||
      !phoneNumber?.trim() ||
      !state?.trim() ||
      !county?.trim() ||
      !town?.trim() ||
      !platform?.trim()
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await prisma.sellerUser.findUnique({
      where: { phoneNumber: phoneNumber.trim() },
    });

    if (exists) {
      return res.status(400).json({ message: "Phone Number already in use" });
    }

    let code: string;
    let existingCode;

    do {
      code = generateCode();
      existingCode = await prisma.sellerUser.findUnique({ where: { code } });
    } while (existingCode);

    const user = await prisma.sellerUser.create({
      data: {
        storeName: storeName.trim(),
        phoneNumber: phoneNumber.trim(),
        state: state.trim(),
        county: county.trim(),
        town: town.trim(),
        platform: platform.trim(),
        code,
      },
      select: { id: true, code: true },
    });

    const token = signToken({ id: user.id });
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({ user });
  } catch (error) {
    return handleError(res, "Register", error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { code } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({ message: "Code is missing!" });
    }

    const user = await prisma.sellerUser.findUnique({
      where: { code: code.trim() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Code" });
    }

    const safeUser = {
      id: user.id,
      storeName: user.storeName,
      phoneNumber: user.phoneNumber,
    };

    const token = signToken({ id: user.id });
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ user: safeUser });
  } catch (error) {
    return handleError(res, "Login", error);
  }
}

export async function createSellerComplaint(req: any, res: Response) {
  try {
    const {
      issues,
      products,
      barcode,
      duration,
      distributor,
      imageUrl,
      details,
    } = req.body;

    const userId = req.user.id;
    const issuesArr = normalizeToArray(issues);
    const productsArr = normalizeToArray(products);

    if (
      issuesArr.length === 0 ||
      productsArr.length === 0 ||
      !duration?.trim() ||
      !distributor?.trim()
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const complaint = await prisma.complaint.create({
      data: {
        issues: issuesArr.map((i) => i.trim()),
        products: productsArr.map((p) => p.trim()),
        barcode: barcode?.trim() || null,
        duration: duration.trim(),
        distributor: distributor.trim(),
        imageUrl: imageUrl?.trim() || null,
        details: details?.trim() || null,
        userId,
      },
    });

    return res.status(201).json({ complaint });
  } catch (error) {
    return handleError(res, "Complaint Form", error);
  }
}

export async function createConsumerComplaint(req: Request, res: Response) {
  try {
    const {
      companyName,
      companyProduct,
      state,
      county,
      town,
      imageUrl,
      complain,
      name,
      phoneNumber,
      email,
    } = req.body;

    if (
      !companyName?.trim() ||
      !companyProduct?.trim() ||
      !state?.trim() ||
      !county?.trim() ||
      !town?.trim() ||
      !complain?.trim() ||
      !name?.trim() ||
      !phoneNumber?.trim() ||
      !email?.trim()
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existPhoneNumber = await prisma.consumerUser.findUnique({
      where: { phoneNumber: phoneNumber.trim() },
    });

    if (existPhoneNumber) {
      return res.status(400).json({ message: "Phone Number already in use" });
    }

    const existEmail = await prisma.consumerUser.findUnique({
      where: { email: email.trim() },
    });

    if (existEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const safeImageUrl =
      typeof imageUrl === "string" && imageUrl.trim().length > 0
        ? imageUrl.trim()
        : null;

    const user = await prisma.consumerUser.create({
      data: {
        companyName: companyName.trim(),
        companyProduct: companyProduct.trim(),
        state: state.trim(),
        county: county.trim(),
        town: town.trim(),
        imageUrl: safeImageUrl,
        details: complain.trim(),
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    return handleError(res, "Complain Form", error);
  }
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is missing!" });
    }
    if (!password?.trim()) {
      return res.status(400).json({ message: "Password is missing!" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.trim() },
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isValid = await bcrypt.compare(password.trim(), admin.password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const safeAdmin = { id: admin.id, email: admin.email };
    const token = signToken({ id: admin.id });
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ user: safeAdmin });
  } catch (error) {
    return handleError(res, "Admin Login", error);
  }
}

export async function getAllSellerComplaints(req: Request, res: Response) {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            storeName: true,
            phoneNumber: true,
            state: true,
            county: true,
            town: true,
            platform: true,
          },
        },
      },
    });

    return res.status(200).json({ complaints });
  } catch (error) {
    return handleError(res, "Get Seller Complaints", error);
  }
}

export async function getAllConsumerComplaints(req: Request, res: Response) {
  try {
    const complaints = await prisma.consumerUser.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ complaints });
  } catch (error) {
    return handleError(res, "Get Consumer Complaints", error);
  }
}

export async function getMe(req: any, res: Response) {
  try {
    const user = await prisma.sellerUser.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        storeName: true,
        phoneNumber: true,
        state: true,
        county: true,
        town: true,
        platform: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return handleError(res, "Me", error);
  }
}
