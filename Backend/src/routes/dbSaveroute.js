import express from "express";
import {verifyBeta } from "../controllers/verify.js";
const save_route = express.Router();

save_route.post('/save',verifyBeta)

export default save_route   