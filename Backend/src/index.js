import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import suggestion_route from "./routes/suggestion_route.js";
import response_route from "./routes/response_route.js";
import save_route from "./routes/dbSaveroute.js";

import cors from 'cors'
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use("/get", response_route);
app.use("/sug", suggestion_route);
app.use('/db',save_route)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


