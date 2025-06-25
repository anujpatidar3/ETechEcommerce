import { users, categories, products, inquiries, type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct, type Inquiry, type InsertInquiry } from "./schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: { featured?: boolean; search?: string }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Inquiries
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private inquiries: Map<number, Inquiry>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentInquiryId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.inquiries = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentInquiryId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const electricalCategory: Category = {
      id: this.currentCategoryId++,
      name: "Electrical",
      slug: "electrical",
      description: "Electrical products including switches, wires, and circuit breakers",
      parentId: null,
    };
    
    const sanitaryCategory: Category = {
      id: this.currentCategoryId++,
      name: "Sanitary",
      slug: "sanitary",
      description: "Sanitary products including faucets, pipes, and bathroom fittings",
      parentId: null,
    };

    this.categories.set(electricalCategory.id, electricalCategory);
    this.categories.set(sanitaryCategory.id, sanitaryCategory);

    // Initialize products
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        name: "Premium Wall Switch - White",
        slug: "premium-wall-switch-white",
        description: "High-quality wall switch with modern design and reliable performance",
        price: "2499",
        originalPrice: "2999",
        brand: "Schneider Electric",
        categoryId: electricalCategory.id,
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
        categoryId: sanitaryCategory.id,
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
        categoryId: electricalCategory.id,
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
      },
      {
        name: "Copper Pipe - 22mm x 3m",
        slug: "copper-pipe-22mm-3m",
        description: "High-grade copper pipe for plumbing installations",
        price: "3499",
        originalPrice: null,
        brand: "ProPlumb",
        categoryId: sanitaryCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        inStock: true,
        featured: false,
        specifications: JSON.stringify({
          diameter: "22mm",
          length: "3m",
          material: "Copper",
          grade: "Commercial"
        }),
        createdAt: new Date(),
      },
      {
        name: "Basin Mixer Tap - Chrome",
        slug: "basin-mixer-tap-chrome",
        description: "Modern basin mixer tap with ceramic disc technology",
        price: "12999",
        originalPrice: null,
        brand: "Hansgrohe",
        categoryId: sanitaryCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        inStock: true,
        featured: false,
        specifications: JSON.stringify({
          finish: "Chrome",
          type: "Single lever",
          cartridge: "Ceramic disc",
          warranty: "5 years"
        }),
        createdAt: new Date(),
      },
      {
        name: "Circuit Breaker 20A",
        slug: "circuit-breaker-20a",
        description: "Industrial-grade circuit breaker for electrical protection",
        price: "4599",
        originalPrice: null,
        brand: "ABB",
        categoryId: electricalCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        inStock: true,
        featured: false,
        specifications: JSON.stringify({
          current: "20A",
          voltage: "240V",
          poles: "Single pole",
          type: "MCB"
        }),
        createdAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      const productWithId: Product = { ...product, id: this.currentProductId++ };
      this.products.set(productWithId.id, productWithId);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
        ...insertUser,
        id,
        accessLevel: insertUser.accessLevel ?? "User", // default to "User" if not provided
        createdAt: insertUser.createdAt ?? new Date(), // default to now if not provided
    };    
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = {
        ...insertCategory,
        id,
        description: insertCategory.description ?? null,
        parentId: insertCategory.parentId ?? null,
    };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getProducts(filters?: { featured?: boolean; search?: string }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (filters?.featured !== undefined) {
      products = products.filter(product => product.featured === filters.featured);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    return products.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.slug === slug);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      name: insertProduct.name,
      slug: insertProduct.slug,
      description: insertProduct.description ?? null,
      brand: insertProduct.brand,
      price: insertProduct.price,
      originalPrice: insertProduct.originalPrice ?? null,
      categoryId: insertProduct.categoryId,
      imageUrl: insertProduct.imageUrl,
      rating: insertProduct.rating ?? null,
      inStock: insertProduct.inStock ?? null,
      featured: insertProduct.featured ?? null,
      specifications: insertProduct.specifications ?? null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  // Inquiry methods
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentInquiryId++;
    const inquiry: Inquiry = { 
      ...insertInquiry, 
      id,
      createdAt: new Date(),
      phone: insertInquiry.phone ?? null,
      projectType: insertInquiry.projectType ?? null,
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }
}

export const storage = new MemStorage();
