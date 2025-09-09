import mongoose from "mongoose";

export interface IProduct {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  originalPrice?: string;
  brand: string;
  categoryId: mongoose.Types.ObjectId;
  imageUrl: string;
  rating?: string;
  inStock: boolean;
  featured: boolean;
  specifications?: string;
  createdAt?: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    price: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: String,
    },
    brand: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", productSchema);
