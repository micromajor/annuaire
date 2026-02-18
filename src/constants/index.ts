export const METIERS = [
  { slug: "macon", label: "Maçon" },
  { slug: "plombier", label: "Plombier" },
  { slug: "electricien", label: "Électricien" },
  { slug: "menuisier", label: "Menuisier" },
  { slug: "peintre", label: "Peintre" },
  { slug: "couvreur", label: "Couvreur" },
  { slug: "carreleur", label: "Carreleur" },
  { slug: "chauffagiste", label: "Chauffagiste" },
  { slug: "plaquiste", label: "Plaquiste" },
  { slug: "charpentier", label: "Charpentier" },
] as const;

export type MetierSlug = (typeof METIERS)[number]["slug"];

export const COMMUNES_NANTES_EST = [
  // Utilisé pour le combobox de recherche homepage (sous-sélection des principales villes)
  { nom: "Nantes", codePostal: "44000" },
  { nom: "Saint-Herblain", codePostal: "44800" },
  { nom: "Rezé", codePostal: "44400" },
  { nom: "Orvault", codePostal: "44700" },
  { nom: "Saint-Sébastien-sur-Loire", codePostal: "44230" },
  { nom: "Vertou", codePostal: "44120" },
  { nom: "Carquefou", codePostal: "44470" },
  { nom: "Sainte-Luce-sur-Loire", codePostal: "44980" },
  { nom: "La Chapelle-sur-Erdre", codePostal: "44240" },
  { nom: "Bouguenais", codePostal: "44340" },
  { nom: "Thouaré-sur-Loire", codePostal: "44470" },
  { nom: "Mauves-sur-Loire", codePostal: "44470" },
  { nom: "Ancenis-Saint-Géréon", codePostal: "44150" },
  { nom: "Varades", codePostal: "44370" },
  { nom: "Clisson", codePostal: "44190" },
  { nom: "Vallet", codePostal: "44330" },
  { nom: "Nort-sur-Erdre", codePostal: "44390" },
  { nom: "Saint-Mars-la-Jaille", codePostal: "44540" },
  { nom: "Le Loroux-Bottereau", codePostal: "44430" },
  { nom: "Basse-Goulaine", codePostal: "44115" },
] as const;

export const TYPES_TRAVAUX = [
  "Neuf / Construction",
  "Rénovation",
  "Entretien / Maintenance",
  "Dépannage urgent",
  "Devis / Estimation",
  "Autre",
] as const;

export const PAGINATION = {
  ARTISANS_PAR_PAGE: 20,
} as const;
