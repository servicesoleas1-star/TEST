import { Router } from "express";
import {
  getTicketHandler,
  getMessagesHandler,
  addMessageHandler,
  updateStatusHandler,
  reopenTicketHandler,
} from "../controllers/ticketMessagesController.js";

const router = Router({ mergeParams: true });

router.get("/", getTicketHandler);
router.get("/messages", getMessagesHandler);
router.post("/messages", addMessageHandler);
router.patch("/status", updateStatusHandler);
router.post("/reopen", reopenTicketHandler);

export default router;