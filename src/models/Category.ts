import mongoose from "mongoose";

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt?: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
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
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
