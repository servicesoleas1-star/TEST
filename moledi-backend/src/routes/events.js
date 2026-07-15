import { Router } from "express";
import { getEventListings, getEventListingDetail } from "../controllers/eventListingsController.js";

const router = Router();

router.get("/", getEventListings);
router.get("/:slug", getEventListingDetail);

export default router;
