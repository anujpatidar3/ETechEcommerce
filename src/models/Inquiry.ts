import mongoose from "mongoose";

export interface IInquiry {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status?: "pending" | "responded" | "closed";
  response?: string;
  submittedAt?: Date;
  respondedAt?: Date;
}

const inquirySchema = new mongoose.Schema<IInquiry>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "responded", "closed"],
      default: "pending",
    },
    response: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
  }
);

const Inquiry =
  mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", inquirySchema);

export default Inquiry;
