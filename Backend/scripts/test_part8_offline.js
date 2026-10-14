import buildResultPayload from "../src/utils/resultPayload.js";

console.log("=== PART 8 OFFLINE TEST: buildResultPayload ===");

const sampleData = {
  claim: "The Great Wall of China is visible from the Moon with the naked eye.",
  verification_status: "fake",
  summary: "Apollo astronauts confirmed that the Great Wall is not visible from the Moon.",
  sources: ["https://nasa.gov/apollo"],
  confidence: 96,
};

// Case 1: Cache hit WITH verified_at
const cacheHitWithDate = buildResultPayload({
  alphaResponse: { success: true, data: sampleData },
  query: "  is great wall visible from moon?  ",
  cacheHit: {
    score: 0.942,
    verifiedAt: "2026-03-15T10:30:00.000Z",
    matchedClaim: "The Great Wall of China is visible from the Moon.",
  },
  tookMs: 45,
});

console.log("\n[Case 1: Cache hit WITH verified_at]");
console.log(JSON.stringify(cacheHitWithDate, null, 2));

// Case 2: Cache hit WITHOUT verified_at (old Pinecone vector)
const cacheHitWithoutDate = buildResultPayload({
  alphaResponse: { success: true, data: sampleData },
  query: "is great wall visible from moon?",
  cacheHit: {
    score: 0.885,
    verifiedAt: null,
    matchedClaim: "The Great Wall of China is visible from the Moon.",
  },
  tookMs: 52,
});

console.log("\n[Case 2: Cache hit WITHOUT verified_at (legacy vector)]");
console.log(JSON.stringify(cacheHitWithoutDate, null, 2));

// Case 3: Fresh result (web search)
const freshResult = buildResultPayload({
  alphaResponse: { success: true, data: sampleData },
  query: "Did NASA land on Mars in 2026?",
  cacheHit: null,
  tookMs: 1450,
});

console.log("\n[Case 3: Fresh result (web search)]");
console.log(JSON.stringify(freshResult, null, 2));

// Case 4: Guest result with guestRemaining
const guestResult = buildResultPayload({
  alphaResponse: { success: true, data: sampleData },
  query: "Is water wet?",
  cacheHit: null,
  tookMs: 820,
  guestRemaining: 1,
});

console.log("\n[Case 4: Guest result with guestRemaining]");
console.log(JSON.stringify(guestResult, null, 2));

// Assertions check
const tests = [
  {
    name: "Case 1 origin & cached",
    pass: cacheHitWithDate.origin === "verified_db" && cacheHitWithDate.cached === true,
  },
  {
    name: "Case 1 verifiedAt preserved",
    pass: cacheHitWithDate.verifiedAt === "2026-03-15T10:30:00.000Z",
  },
  {
    name: "Case 1 query trimmed",
    pass: cacheHitWithDate.query === "is great wall visible from moon?",
  },
  {
    name: "Case 1 matchedClaim & similarity present",
    pass:
      cacheHitWithDate.matchedClaim ===
        "The Great Wall of China is visible from the Moon." &&
      cacheHitWithDate.similarity === 0.942,
  },
  {
    name: "Case 2 verifiedAt is null",
    pass: cacheHitWithoutDate.verifiedAt === null,
  },
  {
    name: "Case 3 origin & cached",
    pass: freshResult.origin === "web_search" && freshResult.cached === false,
  },
  {
    name: "Case 3 matchedClaim & similarity null",
    pass: freshResult.matchedClaim === null && freshResult.similarity === null,
  },
  {
    name: "Case 3 verifiedAt is fresh ISO string",
    pass:
      typeof freshResult.verifiedAt === "string" &&
      !isNaN(Date.parse(freshResult.verifiedAt)),
  },
  {
    name: "Case 4 guestRemaining present",
    pass: guestResult.guestRemaining === 1,
  },
  {
    name: "Case 1-3 guestRemaining omitted when not provided",
    pass:
      !("guestRemaining" in cacheHitWithDate) &&
      !("guestRemaining" in freshResult),
  },
];

console.log("\n=== TEST ASSERTIONS ===");
let allPassed = true;
for (const t of tests) {
  console.log(`${t.pass ? "PASS" : "FAIL"}: ${t.name}`);
  if (!t.pass) allPassed = false;
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log("\nAll 10 assertions passed successfully!");
}
