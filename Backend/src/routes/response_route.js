import express from "express";
import { verifyAlpha, verifyAlphaStream, getStats } from "../controllers/verify.js";
const response_route = express.Router();

response_route.get('/stats', getStats);
response_route.post('/validate', verifyAlpha);
response_route.post('/validate-stream', verifyAlphaStream);

export default response_route;