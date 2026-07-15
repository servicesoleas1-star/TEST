import { Router } from "express";
import { getAcquisitionSources } from "../controllers/acquisitionSourcesController.js";

const router = Router();

router.get("/", getAcquisitionSources);

export default router;
