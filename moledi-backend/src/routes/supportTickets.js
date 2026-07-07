import { Router } from "express";
import {
  createTicketHandler,
  listTicketsHandler,
  getTicketHandler,
} from "../controllers/supportTicketsController.js";

const router = Router();

router.post("/", createTicketHandler);
router.get("/", listTicketsHandler);
router.get("/:ticketId", getTicketHandler);

export default router;