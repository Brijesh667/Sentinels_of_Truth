import GuestResult from "../models/GuestResult.js";
import History from "../models/History.js";

export async function adoptGuestHistory(userId, guestId) {
  if (!userId || !guestId || typeof guestId !== "string") {
    return 0;
  }

  const trimmedGuestId = guestId.trim();
  if (!trimmedGuestId) {
    return 0;
  }

  let migratedCount = 0;

  try {
    while (true) {
      const doc = await GuestResult.findOneAndDelete({ guestId: trimmedGuestId });
      if (!doc) {
        break;
      }

      await History.create({
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
      });

      migratedCount++;
    }

    return migratedCount;
  } catch (error) {
    console.warn(`[adoptGuestHistory] Failed to adopt history for guest ${trimmedGuestId}:`, error.message);
    return migratedCount;
  }
}
