import "./env.js";
import { Pinecone } from "@pinecone-database/pinecone";

let pineconeInstance = null;
let pineconeIndexInstance = null;

export function getPineconeIndex() {
  if (!pineconeIndexInstance) {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME || "mydatabase";
    pineconeInstance = new Pinecone({ apiKey });
    pineconeIndexInstance = pineconeInstance.Index(indexName);
  }
  return pineconeIndexInstance;
}

const pineconeIndexProxy = new Proxy({}, {
  get(target, prop) {
    const idx = getPineconeIndex();
    const val = idx[prop];
    return typeof val === "function" ? val.bind(idx) : val;
  },
});

export default pineconeIndexProxy;
