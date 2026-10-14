export const landingFixtures = [
  {
    id: "fake-web",
    tabLabel: "Fake Claim (Web)",
    query: "Is the Great Wall of China visible from space with the naked eye?",
    result: {
      query: "Is the Great Wall of China visible from space with the naked eye?",
      origin: "web_search",
      cached: false,
      took_ms: 1350,
      data: {
        claim: "The Great Wall of China is visible from low Earth orbit with the unaided eye",
        verification_status: "Fake",
        confidence: 94,
        summary:
          "NASA astronauts and orbital imagery have confirmed that the Great Wall of China is virtually impossible to distinguish from low Earth orbit without telescopic magnification.\n\nBecause the wall is typically only a few meters wide and built using indigenous stones and soil that match the surrounding topography, it does not produce sufficient optical contrast against the terrain.",
        sources: [
          "https://www.nasa.gov/vision/space/workinginspace/great_wall.html",
          "https://www.britannica.com/story/is-the-great-wall-of-china-visible-from-space",
        ],
      },
    },
  },
  {
    id: "verified-web",
    tabLabel: "Verified Claim (Web)",
    query: "Is the Taj Mahal located in Agra, India?",
    result: {
      query: "Is the Taj Mahal located in Agra, India?",
      origin: "web_search",
      cached: false,
      took_ms: 980,
      data: {
        claim: "The Taj Mahal is an ivory-white marble mausoleum on the Yamuna riverbank in Agra, Uttar Pradesh, India",
        verification_status: "Verified",
        confidence: 99,
        summary:
          "The Taj Mahal was commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal. It stands on the right bank of the Yamuna River in Agra, India.\n\nIt was designated a UNESCO World Heritage Site in 1983 and remains one of the world's most documented historical monuments.",
        sources: [
          "https://whc.unesco.org/en/list/252",
          "https://www.britannica.com/topic/Taj-Mahal",
        ],
      },
    },
  },
  {
    id: "cached-db",
    tabLabel: "Database Hit (Instant)",
    query: "Do vaccines cause autism?",
    result: {
      query: "Do vaccines cause autism?",
      origin: "verified_db",
      cached: true,
      verifiedAt: "2026-10-12T10:15:00.000Z",
      matchedClaim: "Routine childhood vaccinations and MMR vaccines cause autism spectrum disorder",
      took_ms: 32,
      data: {
        claim: "Routine childhood vaccinations and MMR vaccines cause autism spectrum disorder",
        verification_status: "Fake",
        confidence: 98,
        summary:
          "Extensive global epidemiological studies conducted across millions of children over multiple decades have conclusively shown no causal link between the MMR vaccine (or any childhood vaccine) and autism.\n\nThe original 1998 claim by Andrew Wakefield was thoroughly retracted by The Lancet after evidence of data falsification and ethical violations.",
        sources: [
          "https://www.cdc.gov/vaccinesafety/concerns/autism.html",
          "https://www.who.int/news-room/questions-and-answers/item/vaccines-and-immunization-myths-and-facts",
        ],
      },
    },
  },
];

export default landingFixtures;
