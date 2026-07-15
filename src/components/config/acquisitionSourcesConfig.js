// config/acquisitionSourcesConfig.js
//
// Rôle : charger la table AcquisitionSource réelle (DC-02) depuis le
// backend, pour le champ "Comment avez-vous connu Moledi Events ?" du
// formulaire d'inscription -- les source_id renvoyés sont de vrais UUID de
// la table acquisition_sources (users.acquisition_source_id les référence
// par clé étrangère), pas des identifiants inventés.

/**
 * @returns {Promise<Array<{source_id: string, name: string}>>}
 */
export async function getActiveAcquisitionSources() {
  try {
    const res = await fetch('/api/acquisition-sources');
    if (!res.ok) return [];
    const data = await res.json();
    return (data.sources || []).map((s) => ({ source_id: s.source_id, name: s.name }));
  } catch {
    return [];
  }
}
