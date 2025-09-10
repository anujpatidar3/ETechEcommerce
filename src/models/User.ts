import mongoose from "mongoose";

export interface IUser {
  _id?: string;
  name?: string;
  email?: string;
  username: string;
  password: string;
  accessLevel: "Admin" | "User";
  createdAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
