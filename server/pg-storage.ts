import { eq, like, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { users, categories, products, inquiries, brands } from "./schema.js";
import type {
  User,
  InsertUser,
  LoginUser,
  Category,
  InsertCategory,
  Product,
  InsertProduct,
  Inquiry,
  InsertInquiry,
  Brand,
  InsertBrand,
} from "./schema";

export interface IStorage {
  // Auth
  login(credentials: LoginUser): Promise<{ user: Omit<User, 'password'>, token: string } | null>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<Omit<User, 'password'> | null>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: { featured?: boolean; search?: string }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;

  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrandById(id: number): Promise<Brand | null>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand | null>;
  deleteBrand(id: number): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Create initial admin user if not exists
      const adminExists = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
      if (adminExists.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.insert(users).values({
          username: 'admin',
          password: hashedPassword,
          accessLevel: 'Admin',
        });
      }

      // Initialize categories if empty
      const categoryCount = await db.select().from(categories).limit(1);
      if (categoryCount.length === 0) {
        const insertedCategories = await db.insert(categories).values([
          {
            name: "Electrical",
            slug: "electrical",
            description: "Electrical products including switches, wires, and circuit breakers",
            parentId: null,
          },
          {
            name: "Sanitary",
            slug: "sanitary", 
            description: "Sanitary products including faucets, pipes, and bathroom fittings",
            parentId: null,
          }
        ]).returning();

        const electricalId = insertedCategories[0].id;
        const sanitaryId = insertedCategories[1].id;

        // Initialize products if empty
        const productCount = await db.select().from(products).limit(1);
        if (productCount.length === 0) {
          await db.insert(products).values([
            {
              name: "Premium Wall Switch - White",
              slug: "premium-wall-switch-white",
              description: "High-quality wall switch with modern design and reliable performance",
              price: "2499",
              originalPrice: "2999",
              brand: "Schneider Electric",
              categoryId: electricalId,
              imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              rating: "4.8",
              inStock: true,
              featured: true,
              specifications: JSON.stringify({
                voltage: "240V",
                current: "16A", 
                color: "White",
                material: "Polycarbonate"
              }),
            },
            {
              name: "Chrome Kitchen Faucet",
              slug: "chrome-kitchen-faucet",
              description: "Modern chrome kitchen faucet with pull-out spray function",
              price: "18999",
              originalPrice: null,
              brand: "Kohler",
              categoryId: sanitaryId,
              imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              rating: "4.6",
              inStock: true,
              featured: true,
              specifications: JSON.stringify({
                finish: "Chrome",
                type: "Pull-out spray",
                mounting: "Single hole",
                warranty: "Lifetime"
              }),
            },
            {
              name: "LED Smart Bulb - 9W",
              slug: "led-smart-bulb-9w",
              description: "Energy-efficient LED smart bulb with WiFi connectivity",
              price: "1599",
              originalPrice: "1999",
              brand: "Philips",
              categoryId: electricalId,
              imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              rating: "4.9",
              inStock: true,
              featured: true,
              specifications: JSON.stringify({
                wattage: "9W",
                lumens: "800",
                colorTemp: "2700K-6500K",
                connectivity: "WiFi"
              }),
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  // Auth methods
  async login(credentials: LoginUser): Promise<{ user: Omit<User, 'password'>, token: string } | null> {
    const user = await db.select().from(users).where(eq(users.username, credentials.username)).limit(1);
    if (user.length === 0) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, user[0].password);
    if (!isValidPassword) return null;

    const token = jwt.sign(
      { userId: user[0].id, username: user[0].username, accessLevel: user[0].accessLevel },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password, ...userWithoutPassword } = user[0];
    return { user: userWithoutPassword, token };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    return result[0];
  }

  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (user.length === 0) return null;
    
    const { password, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  // Product methods
  async getProducts(filters?: { category?: string; featured?: boolean; search?: string }): Promise<Product[]> {
    let whereClauses = [];

    if (filters) {
      if (filters.category) {
        // Find category by slug
        const category = await db.select().from(categories).where(eq(categories.slug, filters.category)).limit(1);
        if (category.length > 0) {
          whereClauses.push(eq(products.categoryId, category[0].id));
        }
      }
      if (filters.featured !== undefined) {
        whereClauses.push(eq(products.featured, filters.featured));
      }
      if (filters.search) {
        whereClauses.push(like(products.name, `%${filters.search}%`));
      }
    }

    let query;
    if (whereClauses.length > 0) {
      query = db.select().from(products).where(and(...whereClauses)).orderBy(desc(products.createdAt));
    } else {
      query = db.select().from(products).orderBy(desc(products.createdAt));
    }
    return await query;
  }

  async getProductById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | null> {
    const result = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Inquiry methods
  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(insertInquiry).returning();
    return result[0];
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(desc(brands.createdAt));
  }

  async getBrandById(id: number): Promise<Brand | null> {
    const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const result = await db.insert(brands).values(insertBrand).returning();
    return result[0];
  }

  async updateBrand(id: number, updateData: Partial<InsertBrand>): Promise<Brand | null> {
    const result = await db.update(brands)
      .set(updateData)
      .where(eq(brands.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteBrand(id: number): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new PostgresStorage();