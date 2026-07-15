import { publicUrlForUpload, publicUrlForVideoUpload } from "../utils/upload.js";

/**
 * POST /api/uploads/image
 * multipart/form-data, champ "image". Réutilisé partout où une image doit
 * être téléversée (photo de couverture de campagne, photo de candidat...)
 * plutôt qu'un champ URL en texte libre.
 */
export function uploadImageHandler(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Aucune image reçue." });
  }
  return res.status(201).json({ url: publicUrlForUpload(req.file.filename) });
}

/**
 * POST /api/uploads/video
 * multipart/form-data, champ "video". Utilisé pour les vidéos additionnelles
 * de candidat/campagne (candidates.videos_urls, polls.videos_urls).
 */
export function uploadVideoHandler(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Aucune vidéo reçue." });
  }
  return res.status(201).json({ url: publicUrlForVideoUpload(req.file.filename) });
}
