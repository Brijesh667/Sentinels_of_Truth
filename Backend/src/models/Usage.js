import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastAt: {
      type: Date,
      default: () => new Date(0),
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

// TTL index to automatically purge expired usage documents
usageSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const Usage = mongoose.models.Usage || mongoose.model("Usage", usageSchema);
export default Usage;
