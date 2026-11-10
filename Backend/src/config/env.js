import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve .env from multiple probable locations
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "Backend/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

export default process.env;
