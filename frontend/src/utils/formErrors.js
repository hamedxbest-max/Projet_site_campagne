/** Libellés français des champs du formulaire étudiant. */
export const STUDENT_FIELD_LABELS = {
  nom: 'Nom',
  prenom: 'Prénom(s)',
  age: 'Âge',
  sexe: 'Sexe',
  filiere: 'Filière',
  niveau_academique: "Niveau d'étude",
  telephone: 'Téléphone',
  email: 'Email',
  ecole: 'Université / Faculté',
  ville_residence: 'Ville de résidence',
  deja_participe_campagne: 'Participation campagne antérieure',
  ressortissant_est: 'Ressortissant Est',
  parle_makaa: "Expression en Maka'a",
  taille_tshirt: 'Taille T-shirt',
  contact_urgence_nom: "Contact d'urgence — nom",
  contact_urgence_lien: "Contact d'urgence — lien",
  contact_urgence_telephone: "Contact d'urgence — téléphone",
  contact_urgence_ville: "Contact d'urgence — ville",
  photo: 'Photo',
};

export const DONOR_FIELD_LABELS = {
  nom: 'Nom',
  telephone: 'Téléphone',
  email: 'Email',
};

export function parseApiFieldErrors(data) {
  if (!data || typeof data !== 'object') return {};
  const errors = {};
  Object.entries(data).forEach(([field, msgs]) => {
    if (field === 'detail') return;
    errors[field] = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
  });
  return errors;
}

export const NETWORK_ERROR_MESSAGE =
  'Connexion impossible. Vérifiez votre connexion internet et réessayez.';

export const SERVER_ERROR_MESSAGE =
  'Le service est momentanément indisponible. Veuillez réessayer dans quelques instants.';

export function isNetworkError(err) {
  return !err?.response;
}

export function formatApiError(err, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  const data = err?.response?.data;
  if (!data) {
    if (isNetworkError(err)) {
      return NETWORK_ERROR_MESSAGE;
    }
    if (err?.response?.status >= 500) {
      return SERVER_ERROR_MESSAGE;
    }
    return fallback;
  }
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) return data.detail.join(' ');
  const parts = Object.entries(parseApiFieldErrors(data)).map(
    ([field, msg]) => `${STUDENT_FIELD_LABELS[field] || field} : ${msg}`,
  );
  if (parts.length) return parts.join(' · ');
  return fallback;
}

export function scrollToFirstFormError() {
  requestAnimationFrame(() => {
    const target = document.querySelector('[data-invalid="true"], .form-summary-error, .field-error');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

export function buildErrorSummary(errors, labels = STUDENT_FIELD_LABELS) {
  return Object.entries(errors).map(([key, msg]) => ({
    key,
    label: labels[key] || key,
    message: msg,
  }));
}
