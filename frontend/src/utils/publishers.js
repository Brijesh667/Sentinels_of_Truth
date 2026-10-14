const PUBLISHER_MAP = {
  "who.int": "World Health Organization",
  "nasa.gov": "NASA",
  "reuters.com": "Reuters",
  "bbc.com": "BBC News",
  "bbc.co.uk": "BBC News",
  "pib.gov.in": "Press Information Bureau (PIB)",
  "thehindu.com": "The Hindu",
  "indianexpress.com": "The Indian Express",
  "altnews.in": "Alt News",
  "boomlive.in": "BOOM Live",
  "snopes.com": "Snopes",
  "factcheck.org": "FactCheck.org",
  "wikipedia.org": "Wikipedia",
  "cdc.gov": "CDC",
  "nih.gov": "NIH",
  "britannica.com": "Encyclopaedia Britannica",
  "nature.com": "Nature",
  "science.org": "Science",
  "mayoclinic.org": "Mayo Clinic",
  "nhs.uk": "NHS",
  "unicef.org": "UNICEF",
  "un.org": "United Nations",
  "apnews.com": "Associated Press",
  "poynter.org": "Poynter",
};

/**
 * Given a URL or hostname, returns { name: string, hostname: string }
 */
export function getPublisherInfo(urlOrHostname) {
  if (!urlOrHostname || typeof urlOrHostname !== "string") {
    return { name: "Source", hostname: "" };
  }

  let hostname = urlOrHostname.trim();
  try {
    if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
      const parsed = new URL(hostname);
      hostname = parsed.hostname;
    }
  } catch {
    // Keep fallback
  }

  // Strip leading www.
  const cleanHostname = hostname.toLowerCase().replace(/^www\./, "");

  // Check exact match
  if (PUBLISHER_MAP[cleanHostname]) {
    return {
      name: PUBLISHER_MAP[cleanHostname],
      hostname: cleanHostname,
    };
  }

  // Check subdomains (e.g. news.un.org -> United Nations)
  for (const [domain, name] of Object.entries(PUBLISHER_MAP)) {
    if (cleanHostname.endsWith("." + domain)) {
      return {
        name,
        hostname: cleanHostname,
      };
    }
  }

  // Fallback: Hostname stripped of www.
  return {
    name: cleanHostname,
    hostname: cleanHostname,
  };
}
