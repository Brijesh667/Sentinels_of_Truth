import mongoose from "mongoose";

const guestResultSchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      required: true,
      index: true,
    },
    query: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    claim: {
      type: String,
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    cached: {
      type: Boolean,
      default: false,
    },
    origin: {
      type: String,
      enum: ["verified_db", "web_search"],
    },
    verifiedAt: {
      type: Date,
    },
    matchedClaim: {
      type: String,
    },
    tookMs: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 86400 }, // TTL: 24 hours
    },
  },
  {
    versionKey: false,
  }
);

guestResultSchema.index({ guestId: 1, createdAt: -1 });

const GuestResult =
  mongoose.models.GuestResult || mongoose.model("GuestResult", guestResultSchema);

export default GuestResult;
