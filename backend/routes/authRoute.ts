import express from "express";
import { randomBytes } from "crypto";
import { prisma } from "../lib/prisma.ts";
import { signToken } from "../utils/jwt.ts";
import { authenticateToken } from "../middleware/authToken.ts";
import { cookieOptions } from "../config/cookies.ts";
import bcrypt from "bcrypt";

const router = express.Router();

function generateCode(length: number = 7): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  const bytes = randomBytes(length);

  return Array.from(bytes)
    .map((b) => letters[b % letters.length])
    .join("");
}

router.post("/register", async (req, res) => {
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
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const exists = await prisma.sellerUser.findUnique({
      where: {
        phoneNumber: phoneNumber.trim(),
      },
    });

    if (exists) {
      return res.status(400).json({
        message: "Phone Number already in use",
      });
    }

    let code: string;
    let existingCode;

    do {
      code = generateCode();

      existingCode = await prisma.sellerUser.findUnique({
        where: {
          code,
        },
      });
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
      select: {
        id: true,
        code: true,
      },
    });

    const token = signToken({
      id: user.id,
    });

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({
        message: "Code is missing!",
      });
    }

    const user = await prisma.sellerUser.findUnique({
      where: {
        code: code.trim(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Code",
      });
    }

    const safeUser = {
      id: user.id,
      storeName: user.storeName,
      phoneNumber: user.phoneNumber,
    };

    const token = signToken({
      id: user.id,
    });

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/user/seller/complaints", authenticateToken, async (req, res) => {
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

    const normalizeToArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.trim()) return [val.trim()];
      return [];
    };

    const issuesArr = normalizeToArray(issues);
    const productsArr = normalizeToArray(products);

    if (
      issuesArr.length === 0 ||
      productsArr.length === 0 ||
      !duration?.trim() ||
      !distributor?.trim()
      // imageUrl no longer required
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const complaint = await prisma.complaint.create({
      data: {
        issues: issuesArr.map((i: string) => i.trim()),
        products: productsArr.map((p: string) => p.trim()),
        barcode: barcode?.trim() || null,
        duration: duration.trim(),
        distributor: distributor.trim(),
        imageUrl: imageUrl?.trim() || null,
        details: details?.trim() || null,
        userId,
      },
    });

    return res.status(201).json({
      complaint,
    });
  } catch (error) {
    console.error("Complaint Form Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/user/consumer/complaints", async (req, res) => {
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
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const existPhoneNumber = await prisma.consumerUser.findUnique({
      where: {
        phoneNumber: phoneNumber.trim(),
      },
    });

    if (existPhoneNumber) {
      return res.status(400).json({
        message: "Phone Number already in use",
      });
    }
    const existEmail = await prisma.consumerUser.findUnique({
      where: {
        email: email.trim(),
      },
    });

    if (existEmail) {
      return res.status(400).json({
        message: "Email already in use",
      });
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

    return res.status(201).json({
      user,
    });
  } catch (error) {
    console.error("Complain Form Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is missing!",
      });
    }
    if (!password?.trim()) {
      return res.status(400).json({
        message: "Password is missing!",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email: email.trim(),
      },
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isValid = await bcrypt.compare(password.trim(), admin.password);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const safeAdmin = {
      id: admin.id,
      email: admin.email,
    };

    const token = signToken({
      id: admin.id,
    });

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      user: safeAdmin,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/admin/seller/complaints", authenticateToken, async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
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
      orderBy: {
        createdAt: "desc", // newest first
      },
    });

    return res.status(200).json({
      complaints,
    });
  } catch (error) {
    console.error("Get Seller Complaints Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get(
  "/admin/consumer/complaints",
  authenticateToken,
  async (req, res) => {
    try {
      const complaints = await prisma.consumerUser.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        complaints,
      });
    } catch (error) {
      console.error("Get Consumer Complaints Error:", error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

router.get("/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.sellerUser.findUnique({
      where: {
        id: req.user.id,
      },
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("Me Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
