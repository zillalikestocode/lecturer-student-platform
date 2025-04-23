import mongoose, { Document } from "mongoose";

interface IOtp extends Document {
  email: string;
  code: string;
}

const otpSchema = new mongoose.Schema<IOtp>({
  email: { type: String, required: true },
  code: { type: String, required: true },
});

export default mongoose.model<IOtp>("Otp", otpSchema);
