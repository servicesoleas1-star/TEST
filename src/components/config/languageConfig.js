// config/languageConfig.js
//
// Rôle : simuler la table LanguageConfig (DC-10, Moledi_UML_Structure_Final.pdf).
// Champs réels : language_id UUID PK, code Language (FR|EN), active Boolean,
// is_default Boolean.
//
// TODO : remplacer getActiveLanguages() par un vrai appel, par exemple :
//   GET /api/platform/languages
// Garder le même contrat de retour (langue par défaut en premier).

const MOCK_LANGUAGE_TABLE = [
  { language_id: 'lang-fr', code: 'FR', active: true, is_default: true },
  { language_id: 'lang-en', code: 'EN', active: true, is_default: false },
];

/**
 * Retourne les langues actives, langue par défaut en premier.
 * @returns {Array<{code: string, isDefault: boolean}>}
 */
export function getActiveLanguages() {
  return MOCK_LANGUAGE_TABLE.filter((l) => l.active)
    .sort((a, b) => Number(b.is_default) - Number(a.is_default))
    .map((l) => ({ code: l.code, isDefault: l.is_default }));
}

/**
 * @returns {string} le code de la langue par défaut, ex. 'FR'
 */
export function getDefaultLanguage() {
  const langs = getActiveLanguages();
  return langs.find((l) => l.isDefault)?.code ?? langs[0]?.code ?? 'FR';
}
