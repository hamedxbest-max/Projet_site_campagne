export const FILIERE_OPTIONS = [
  'Médecine',
  'Pharmacie',
  'Sciences Biomédicales',
  'Technique pharmaceutiques',
  'Technicien Médico sanitaire',
  'Nutrition et Diététique',
  'Psychologie humaine',
  'Infirmier Diplômé d\'état',
  'Odontostomatologie',
  'Kinésithérapie',
  'Imagerie médicale',
];

export const NIVEAU_ETUDE_OPTIONS = [
  { value: 'licence1', label: 'Licence 1' },
  { value: 'licence2', label: 'Licence 2' },
  { value: 'licence3', label: 'Licence 3' },
  { value: 'master1', label: 'Master 1' },
  { value: 'master2', label: 'Master 2' },
  { value: 'doctorat', label: 'Doctorat' },
];

export const TAILLE_TSHIRT_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const EMPTY_STUDENT_FORM = {
  nom: '',
  prenom: '',
  age: '',
  sexe: '',
  filiere: '',
  niveau_academique: '',
  telephone: '',
  email: '',
  ecole: '',
  ville_residence: '',
  deja_participe_campagne: '',
  ressortissant_est: '',
  parle_makaa: '',
  taille_tshirt: '',
  allergies_sante: '',
  attentes_campagne: '',
  contact_urgence_nom: '',
  contact_urgence_lien: '',
  contact_urgence_telephone: '',
  contact_urgence_ville: '',
  methode_preferee: 'orange',
};
