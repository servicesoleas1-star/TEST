import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";

// ---------------------------------------------------------------------------
// Upload d'images (photo de couverture de campagne, photos de candidats...).
// Même pattern de stockage que les PV de clôture (services/closingReportService.js) :
// disque local du backend, servi en statique via /uploads (voir app.js) — à
// remplacer par un vrai bucket (S3/Supabase Storage) en production.
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "images");
const VIDEO_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "videos");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(VIDEO_UPLOAD_DIR)) fs.mkdirSync(VIDEO_UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo, cohérent avec la limite pièces jointes support
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Format d'image non supporté (jpeg, png, webp, gif uniquement)."));
    return;
  }
  cb(null, true);
}

function videoFileFilter(req, file, cb) {
  if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Format de vidéo non supporté (mp4, webm, mov, mkv uniquement)."));
    return;
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
});

export function publicUrlForUpload(filename) {
  return `/uploads/images/${filename}`;
}

export function publicUrlForVideoUpload(filename) {
  return `/uploads/videos/${filename}`;
}
