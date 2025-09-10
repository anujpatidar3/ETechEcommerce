import mongoose from "mongoose";

export interface IBrand {
  _id?: string;
  name: string;
  createdAt?: Date;
}

const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Brand =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", brandSchema);

export default Brand;
