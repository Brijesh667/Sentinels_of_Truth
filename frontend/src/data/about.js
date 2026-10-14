export const aboutData = {
  intro:
    "Sentinels of Truth is an automated verification system that checks factual claims against live web sources, highlights primary evidence, and remembers verified facts for instant answers.",

  whatItDoes: [
    {
      title: "Ask anything checkable",
      desc: "Paste any factual claim, forwarded message, or news headline in natural language.",
      icon: "chat",
    },
    {
      title: "See the evidence",
      desc: "Review cited sources, an AI-evaluated confidence score, and a structured verdict.",
      icon: "shield",
    },
    {
      title: "Get faster over time",
      desc: "Verified claims are remembered in a semantic database so repeated questions return in milliseconds.",
      icon: "bolt",
    },
  ],

  pipeline: [
    {
      id: "claim",
      label: "Your claim",
      badge: "Input",
      title: "1. You submit a claim",
      detail:
        "You paste a statement, headline, or forwarded message. The system normalizes the text and begins verification immediately without requiring keyword syntax or manual searching.",
    },
    {
      id: "cache",
      label: "Verified database check",
      badge: "Pinecone",
      title: "2. Semantic cache check",
      detail:
        "We convert the claim into a vector embedding and query the Pinecone index for existing matches. If a very close match is found, a fast Gemini polarity check confirms both claims assert the exact same proposition rather than opposites.",
    },
    {
      id: "hit",
      label: "Instant answer",
      badge: "Cache Hit",
      title: "3A. Instant answer from memory",
      detail:
        "When a matching verified claim already exists in memory and is not time-sensitive, the answer is served in milliseconds. Web searches and full model passes are bypassed, saving energy and preserving your daily check quota.",
    },
    {
      id: "miss",
      label: "Alpha agent: Web search & analysis",
      badge: "Cache Miss",
      title: "3B. Live Alpha agent research",
      detail:
        "If the claim is new or time-sensitive, Tavily retrieves live, authoritative web sources. Gemini cross-examines the evidence, evaluates consistency, assigns a confidence score, extracts direct source links, and crafts a concise summary.",
    },
    {
      id: "result",
      label: "Result shown to you",
      badge: "Live Stream",
      title: "4. Live result delivery",
      detail:
        "The verdict ('Verified' or 'Fake'), confidence meter, evidence summary, and primary source links are streamed directly to your screen in real time. If signed in, the check is saved to your private history.",
    },
    {
      id: "beta",
      label: "Beta agent: Evaluation",
      badge: "Background AI",
      title: "5. Background Beta evaluation",
      detail:
        "After the user receives their answer, a secondary Beta agent runs in the background. It embeds the new claim and compares it with existing vector knowledge to prevent database pollution or conflicting entries.",
    },
    {
      id: "decision",
      label: "Insert / Reject / Human review",
      badge: "Triaged",
      title: "6. Database update decision",
      detail:
        "If the claim is genuinely new, it is inserted into the vector database anonymously. If it duplicates existing entries, it is rejected. If it contradicts previous knowledge, it is escalated to a human review queue.",
    },
  ],

  dataLives: {
    shared: {
      title: "Shared verified claims",
      subtitle: "Vector Database (Pinecone)",
      points: [
        "Stores only the claim text, verification verdict, summary, confidence, and source URLs.",
        "Completely anonymous — never records who asked, user accounts, or IP addresses.",
        "Used solely to provide instant answers to future users asking the same question.",
      ],
    },
    personal: {
      title: "Your account",
      subtitle: "Secure Database (MongoDB)",
      points: [
        "Sign-in and accounts are handled securely by Clerk. Our database stores only your personal verification history, never passwords.",
        "Your private history is tied strictly to your Clerk user ID and visible only to you.",
        "You can inspect past results anytime, delete individual checks, or clear your entire history.",
      ],
    },
  },

  limitations: [
    "AI can make errors: Language models can misinterpret complex or ambiguous phrasing. Always inspect the provided primary source links.",
    "Confidence is an internal estimate: The confidence percentage indicates how strongly the retrieved sources agree with the verdict, not a guaranteed mathematical certainty.",
    "Dependent on public web availability: If authoritative reporting or scientific documentation does not exist online, the system cannot verify the claim.",
    "Breaking events have limited coverage: During the first few hours of a developing news event, reliable sources may be incomplete or evolving.",
    "Time-sensitive claims bypass memory: Queries containing words like 'today', 'now', or 'currently' are always checked live to avoid stale answers.",
    "Server cold starts: On free-tier backend hosting, the server may take up to a minute to wake up on the first request after inactivity.",
    "Not professional counsel: Sentinels of Truth is an informational verification tool, not medical, legal, or financial advice.",
  ],

  faq: [
    {
      q: "Where do the answers come from?",
      a: "Answers are derived from live web sources retrieved via Tavily and synthesized by Google Gemini. For previously verified questions, answers are served directly from our vector database.",
    },
    {
      q: "How accurate is the verification?",
      a: "The system relies on primary, reputable sources and cross-examines multiple viewpoints. However, language models can occasionally misread nuance, which is why we display direct source links and a confidence score on every result.",
    },
    {
      q: "What does 'Verified database' mean?",
      a: "When a claim has already been checked and confirmed by our system, it is stored in Pinecone vector storage. If you ask a question that is a very close match, we serve the stored verdict instantly in milliseconds.",
    },
    {
      q: "Is my verification history private?",
      a: "Yes. Your search history is stored in an encrypted database linked strictly to your personal user account. The shared vector database only stores anonymous claim texts and verdicts, never personal data or identities.",
    },
    {
      q: "Do I need an account to use the service?",
      a: "No. Guests can perform a few free checks without creating an account. Creating a free account provides a higher daily verification quota and keeps your past checks saved across sessions.",
    },
    {
      q: "What happens when sources disagree or the answer is uncertain?",
      a: "When evidence is mixed or contradictory, the AI assigns a lower confidence score and highlights discrepancies in the summary. In the backend, contradictory claims are flagged for human review rather than silently overwritten.",
    },
    {
      q: "Can it verify recent breaking news?",
      a: "Yes, because the system queries live web sources rather than relying solely on static training cutoff dates. However, claims depending on the immediate present day always trigger live searches rather than memory lookups.",
    },
    {
      q: "Is Sentinels of Truth open source?",
      a: "Yes. The complete source code, agent architectures, and prompt guidelines are openly available on GitHub. Language support is currently optimized for English, with additional languages undergoing ongoing testing.",
    },
  ],

  authorNote: "",
};

export default aboutData;
