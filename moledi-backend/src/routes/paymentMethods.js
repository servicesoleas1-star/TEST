import { Router } from "express";
import { getPaymentMethods } from "../controllers/paymentMethodsController.js";

const router = Router();

router.get("/", getPaymentMethods);

export default router;
