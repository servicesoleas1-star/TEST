// pages/CookiesPage.jsx
// Route publique : /cookies  [MVP]
//
// ⚠️ À ne pas confondre avec le BANDEAU de consentement cookies (composant
// séparé, ticket LAN-15, pas encore fait). Cette page est le TEXTE légal
// explicatif que le bandeau peut lier ("en savoir plus"), pas le bandeau
// lui-même.
import LegalPageContent from '../components/LegalPageContent';

export default function CookiesPage() {
  return <LegalPageContent type="COOKIES" />;
}
