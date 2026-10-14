import GuestResult from "../models/GuestResult.js";
import History from "../models/History.js";
import User from "../models/User.js";

export async function adoptGuestHistory(userId, guestId) {
  if (!userId || !guestId || typeof guestId !== "string") {
    return 0;
  }

  const trimmedGuestId = guestId.trim();
  if (!trimmedGuestId) {
    return 0;
  }

  try {
    const guestDocs = await GuestResult.find({ guestId: trimmedGuestId }).lean();
    if (!guestDocs || guestDocs.length === 0) {
      return 0;
    }

    const historyDocs = guestDocs.map((doc) => ({
      userId,
      query: doc.query || doc.claim,
      claim: doc.claim,
      result: doc.result,
      cached: Boolean(doc.cached),
      origin: doc.origin || (doc.cached ? "verified_db" : "web_search"),
      verifiedAt: doc.verifiedAt || null,
      matchedClaim: doc.matchedClaim || null,
      tookMs: doc.tookMs || 0,
      createdAt: doc.createdAt || new Date(),
    }));

    await History.insertMany(historyDocs);
    await GuestResult.deleteMany({ guestId: trimmedGuestId });
    await User.findByIdAndUpdate(userId, {
      $inc: { totalVerifications: historyDocs.length },
    });

    return historyDocs.length;
  } catch (error) {
    console.warn(`[adoptGuestHistory] Failed to adopt history for guest ${trimmedGuestId}:`, error.message);
    return 0;
  }
}
