import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
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
    },
  },
  {
    versionKey: false,
  }
);

historySchema.index({ userId: 1, createdAt: -1 });

const History = mongoose.models.History || mongoose.model("History", historySchema);
export default History;
