import express from "express";
const suggestion_route = express.Router();
import query_suggestion from "../controllers/query_suggestion.js";
suggestion_route.post("/suggestion", query_suggestion);
export default suggestion_route;
