import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { storage } from "./pg-storage.js";
import { insertInquirySchema, insertProductSchema, loginSchema, insertUserSchema, insertBrandSchema } from "./schema.js";
import { z } from "zod";

// JWT authentication middleware
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    accessLevel: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("Authenticating token...", req.cookies);
  // Check for token in cookies or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  console.log("Token from cookie or header:", token);
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.accessLevel !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Auth API
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await storage.login(validatedData);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.cookie('token', result.token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({ user: result.user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(parseInt(req.user!.userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register API
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      res.status(500).json({ message: "User registration failed" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
        search: req.query.search as string,
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin Products API
  app.post("/api/admin/products", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const updateData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(parseInt(req.params.id), updateData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Inquiries API
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inquiry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  app.get("/api/admin/inquiries", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Brands API
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Admin Brands API
  app.get("/api/admin/brands", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.post("/api/admin/brands", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(validatedData);
      res.status(201).json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid brand data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.put("/api/admin/brands/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const updateData = insertBrandSchema.partial().parse(req.body);
      const brand = await storage.updateBrand(parseInt(req.params.id), updateData);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid brand data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete("/api/admin/brands/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteBrand(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
