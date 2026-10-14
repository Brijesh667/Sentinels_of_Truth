/**
 * Pure helper to construct the payload for SSE 'result' events.
 * No external database or network dependencies.
 *
 * @param {Object} params
 * @param {Object} params.alphaResponse - Result object containing { success, data }
 * @param {string} params.query - Original user query text
 * @param {Object|null|boolean} params.cacheHit - Cache hit object { score, verifiedAt, matchedClaim } or null
 * @param {number} params.tookMs - Elapsed duration in milliseconds
 * @param {number} [params.guestRemaining] - Remaining quota for guest users
 * @returns {Object} Final result payload
 */
export function buildResultPayload({
  alphaResponse,
  query,
  cacheHit,
  tookMs,
  guestRemaining,
}) {
  const isCacheHit = Boolean(cacheHit);
  const trimmedQuery = typeof query === "string" ? query.trim() : "";

  let verifiedAt = null;
  let matchedClaim = null;
  let similarity = null;

  if (isCacheHit) {
    verifiedAt = cacheHit?.verifiedAt || null;
    matchedClaim = cacheHit?.matchedClaim || null;
    similarity =
      typeof cacheHit?.score === "number"
        ? cacheHit.score
        : typeof cacheHit?.similarity === "number"
        ? cacheHit.similarity
        : null;
  } else {
    verifiedAt = new Date().toISOString();
    matchedClaim = null;
    similarity = null;
  }

  const payload = {
    ...(alphaResponse || {}),
    query: trimmedQuery,
    origin: isCacheHit ? "verified_db" : "web_search",
    cached: isCacheHit,
    verifiedAt,
    matchedClaim,
    similarity,
    took_ms: tookMs,
  };

  if (guestRemaining !== undefined) {
    payload.guestRemaining = guestRemaining;
  }

  return payload;
}

export default buildResultPayload;
