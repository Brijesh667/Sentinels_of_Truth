import express from "express";
import { verifyAlpha, verifyBeta } from "../controllers/verify.js";
const response_route = express.Router();

response_route.post('/validate',verifyAlpha);

export default response_route   