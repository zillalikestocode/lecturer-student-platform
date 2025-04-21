import mongoose from "mongoose";
import bcrypt from "bcrypt";

// User interface
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: "lecturer" | "student";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ["lecturer", "student"],
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  //@ts-ignore
  const user = this as IUser;

  // Only hash the password if it has been modified or is new
  if (!user.isModified("password")) return next();

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Replace the plaintext password with the hashed one
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
