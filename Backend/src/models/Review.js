import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    claim: {
      type: String,
      required: true,
    },
    aiResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    existingMatches: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
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

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
