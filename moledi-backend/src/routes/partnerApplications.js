import { Router } from "express";
import { submitPartnerApplication } from "../controllers/partnerApplicationsController.js";

const router = Router();

router.post("/", submitPartnerApplication);

export default router;
