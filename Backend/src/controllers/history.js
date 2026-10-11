import History from "../models/History.js";

export const getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("_id claim result cached createdAt");

    return res.status(200).json(history);
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
