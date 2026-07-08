import React from "react";
import { useParams } from "react-router-dom";
import PollRulesSection from "../components/PollRulesSection.jsx";

// ---------------------------------------------------------------------------
// Moledi Events — Page publique du scrutin (/vote/:slug)
// Version minimale : ne contient que la section Règles (#regles) pour cette
// tâche. Les autres sections (Accueil, Candidats, FAQ, Résultats...) seront
// ajoutées par leurs tickets respectifs, dans ce même fichier.
// ---------------------------------------------------------------------------

export default function PollPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <PollRulesSection slug={slug} />
      </div>
    </div>
  );
}