import History from "../models/History.js";
import GuestResult from "../models/GuestResult.js";

export const getHistory = async (req, res) => {
  try {
    let docs = [];

    if (req.user?.id) {
      docs = await History.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    } else if (req.guestId) {
      docs = await GuestResult.find({ guestId: req.guestId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

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
    let deleted = null;

    if (req.user?.id) {
      deleted = await History.findOneAndDelete({
        _id: id,
        userId: req.user.id,
      });
    } else if (req.guestId) {
      deleted = await GuestResult.findOneAndDelete({
        _id: id,
        guestId: req.guestId,
      });
    }

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
    if (req.user?.id) {
      await History.deleteMany({ userId: req.user.id });
    } else if (req.guestId) {
      await GuestResult.deleteMany({ guestId: req.guestId });
    }

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
