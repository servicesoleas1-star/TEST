import { Router } from "express";
import { uploadImage, uploadVideo } from "../utils/upload.js";
import { uploadImageHandler, uploadVideoHandler } from "../controllers/uploadsController.js";

const router = Router();

router.post("/image", uploadImage.single("image"), uploadImageHandler);
router.post("/video", uploadVideo.single("video"), uploadVideoHandler);

export default router;
