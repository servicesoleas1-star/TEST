// components/TeamMemberCard.jsx
//
// Carte d'un membre de l'équipe, inspirée du composant "Carte profil" de la
// charte UI (avatar, nom, rôle). Affiche un avatar par défaut (initiales)
// si aucune photo n'est fournie, plutôt qu'une image cassée.

/**
 * @param {{ member: { id: string, name: string, role: string, photoUrl: string|null } }} props
 */
export default function TeamMemberCard({ member }) {
  const initials = member.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm">
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={member.name}
          className="mb-4 h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full
                     bg-[color:var(--color-secondary,#2B6BFF)] text-lg font-bold text-white"
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
      <p className="font-semibold text-[color:var(--color-ink,#0B1324)]">{member.name}</p>
      <p className="text-sm text-[color:var(--color-slate,#475569)]">{member.role}</p>
    </div>
  );
}
