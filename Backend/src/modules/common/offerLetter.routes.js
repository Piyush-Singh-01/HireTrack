import express from "express";
import {
  getOfferLetterTemplate,
  saveOfferLetterTemplate,
  sendOfferLetter,
} from "./offerLetterTemplateController.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

router.get("/", protect, allAccess, getOfferLetterTemplate);
router.post("/", protect, allAccess, saveOfferLetterTemplate);
router.post("/send", protect, allAccess, sendOfferLetter);

export default router;

