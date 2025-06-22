import { MongoClient, Db, Collection } from 'mongodb';
import { User, Category, Product, Inquiry } from '@shared/schema';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect() {
    if (this.client) return;

    // Use environment variable or default for local development
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'etech_enterprises';

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(dbName);
    
    console.log('Connected to MongoDB');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  getCollection<T>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<T>(name);
  }

  get users(): Collection<User> {
    return this.getCollection<User>('users');
  }

  get categories(): Collection<Category> {
    return this.getCollection<Category>('categories');
  }

  get products(): Collection<Product> {
    return this.getCollection<Product>('products');
  }

  get inquiries(): Collection<Inquiry> {
    return this.getCollection<Inquiry>('inquiries');
  }
}

export const database = new Database();