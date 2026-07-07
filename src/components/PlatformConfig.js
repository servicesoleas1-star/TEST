/**
 * Configuration plateforme recuperee depuis le back-office admin.
 *
 * Pour l'instant (MVP, pas encore de vraie API), on simule avec une
 * valeur en dur ici. Des que l'endpoint admin existe
 * (ex: GET /api/platform/settings), remplacer getPlatformConfig()
 * par un vrai appel API / fetch cote serveur.
 */

// TODO: remplacer par un appel API reel vers le back-office
// quand l'endpoint sera disponible (voir ticket back-office correspondant)
const MOCK_CONFIG = {
  supportWhatsAppNumber: '237600000000', // format international, sans "+"
};

export function getPlatformConfig() {
  return MOCK_CONFIG;
}
