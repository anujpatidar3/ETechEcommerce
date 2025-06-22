import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database } from './database';
import { 
  User, 
  InsertUser, 
  LoginUser,
  Category, 
  InsertCategory, 
  Product, 
  InsertProduct, 
  Inquiry, 
  InsertInquiry 
} from '@shared/schema';

export interface IMongoStorage {
  // Auth
  login(credentials: LoginUser): Promise<{ user: Omit<User, 'password'>, token: string } | null>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<Omit<User, 'password'> | null>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: { categoryId?: string; featured?: boolean; search?: string }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
}

export class MongoStorage implements IMongoStorage {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      await database.connect();
      
      // Create initial admin user if not exists
      const adminExists = await database.users.findOne({ username: 'admin' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await database.users.insertOne({
          username: 'admin',
          password: hashedPassword,
          accessLevel: 'Admin',
          createdAt: new Date()
        });
      }

      // Initialize categories if empty
      const categoryCount = await database.categories.countDocuments();
      if (categoryCount === 0) {
        const categories = [
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
        ];
        
        const insertedCategories = await database.categories.insertMany(categories);
        const electricalId = insertedCategories.insertedIds[0].toString();
        const sanitaryId = insertedCategories.insertedIds[1].toString();

        // Initialize products if empty
        const productCount = await database.products.countDocuments();
        if (productCount === 0) {
          const products = [
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
              createdAt: new Date(),
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
              createdAt: new Date(),
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
              createdAt: new Date(),
            }
          ];
          
          await database.products.insertMany(products);
        }
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  // Auth methods
  async login(credentials: LoginUser): Promise<{ user: Omit<User, 'password'>, token: string } | null> {
    const user = await database.users.findOne({ username: credentials.username });
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) return null;

    const token = jwt.sign(
      { userId: user._id, username: user.username, accessLevel: user.accessLevel },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user = {
      ...insertUser,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await database.users.insertOne(user);
    return { ...user, _id: result.insertedId.toString() };
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await database.users.findOne({ _id: new ObjectId(id) });
      if (!user) return null;
      
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      return null;
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const categories = await database.categories.find({}).toArray();
    return categories.map(cat => ({ ...cat, _id: cat._id?.toString() }));
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const category = await database.categories.findOne({ slug });
    return category ? { ...category, _id: category._id?.toString() } : null;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await database.categories.insertOne(insertCategory);
    return { ...insertCategory, _id: result.insertedId.toString() };
  }

  // Product methods
  async getProducts(filters?: { categoryId?: string; featured?: boolean; search?: string }): Promise<Product[]> {
    const query: any = {};
    
    if (filters?.categoryId) {
      query.categoryId = filters.categoryId;
    }
    
    if (filters?.featured !== undefined) {
      query.featured = filters.featured;
    }
    
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { brand: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const products = await database.products.find(query).sort({ createdAt: -1 }).toArray();
    return products.map(product => ({ ...product, _id: product._id?.toString() }));
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await database.products.findOne({ _id: new ObjectId(id) });
      return product ? { ...product, _id: product._id?.toString() } : null;
    } catch {
      return null;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = await database.products.findOne({ slug });
    return product ? { ...product, _id: product._id?.toString() } : null;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product = {
      ...insertProduct,
      createdAt: new Date()
    };
    
    const result = await database.products.insertOne(product);
    return { ...product, _id: result.insertedId.toString() };
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | null> {
    try {
      const result = await database.products.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result ? { ...result, _id: result._id?.toString() } : null;
    } catch {
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await database.products.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }

  // Inquiry methods
  async getInquiries(): Promise<Inquiry[]> {
    const inquiries = await database.inquiries.find({}).sort({ createdAt: -1 }).toArray();
    return inquiries.map(inquiry => ({ ...inquiry, _id: inquiry._id?.toString() }));
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const inquiry = {
      ...insertInquiry,
      createdAt: new Date()
    };
    
    const result = await database.inquiries.insertOne(inquiry);
    return { ...inquiry, _id: result.insertedId.toString() };
  }
}

export const mongoStorage = new MongoStorage();