import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import suggestion_route from "./routes/suggestion_route.js";
import response_route from "./routes/response_route.js";
import save_route from "./routes/dbSaveroute.js";
// import { cores } from "cors";
import cors from 'cors'
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use("/get", response_route);
app.use("/sug", suggestion_route);
app.use('/db',save_route)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// const { default: getSuggestions } = await import("./utils/get_suggestion.js");
// import alpha from "./agent/alpha.js";

// const result = await getSuggestions("today is");

// console.log(JSON.stringify(result, null, 2));

// const obj = {
//   apiKey: process.env.GOOGLE_API_KEY,
//   model: "gemini-2.5-flash",
//   query: "government ban india's 100 note currency",
// };

// alpha(obj);
