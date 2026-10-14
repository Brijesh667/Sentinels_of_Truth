import History from "../models/History.js";

export const getHistory = async (req, res) => {
  try {
    const docs = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = docs.map((doc) => ({
      _id: doc._id,
      query: doc.query ?? doc.claim,
      claim: doc.claim,
      result: doc.result,
      cached: Boolean(doc.cached),
      origin: doc.origin ?? (doc.cached ? "verified_db" : "web_search"),
      verifiedAt: doc.verifiedAt ?? null,
      matchedClaim: doc.matchedClaim ?? null,
      tookMs: doc.tookMs ?? 0,
      createdAt: doc.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to fetch history",
    });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await History.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        error: "History entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "History entry deleted",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to delete history item",
    });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      message: "History cleared",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to clear history",
    });
  }
};
