// components/PasswordStrengthMeter.jsx
//
// Barre de robustesse à 4 segments + libellé, mise à jour à chaque frappe.
// Ne contient aucune logique de calcul (voir passwordStrengthService.js) --
// affiche seulement ce qu'on lui donne.

import { getPasswordStrength } from '../services/passwordStrengthService';

/**
 * @param {{ password: string }} props
 */
export default function PasswordStrengthMeter({ password }) {
  const { score, label, colorVar } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: segment <= score ? colorVar : 'var(--color-border, #E2E8F0)',
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-xs font-medium" style={{ color: colorVar }}>
        {label}
      </p>
    </div>
  );
}
