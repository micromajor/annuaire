export const COMMUNES_NANTES_EST = [
  { nom: "Nantes", codePostal: "44000", lat: 47.2184, lng: -1.5536 },
  { nom: "Saint-Herblain", codePostal: "44800", lat: 47.2139, lng: -1.6483 },
  { nom: "Rezé", codePostal: "44400", lat: 47.1786, lng: -1.5503 },
  { nom: "Orvault", codePostal: "44700", lat: 47.2673, lng: -1.6306 },
  { nom: "Saint-Sébastien-sur-Loire", codePostal: "44230", lat: 47.2003, lng: -1.5013 },
  { nom: "Vertou", codePostal: "44120", lat: 47.1658, lng: -1.4711 },
  { nom: "Carquefou", codePostal: "44470", lat: 47.2953, lng: -1.4943 },
  { nom: "Sainte-Luce-sur-Loire", codePostal: "44980", lat: 47.2583, lng: -1.4664 },
  { nom: "La Chapelle-sur-Erdre", codePostal: "44240", lat: 47.3044, lng: -1.5539 },
  { nom: "Bouguenais", codePostal: "44340", lat: 47.1575, lng: -1.6102 },
  { nom: "Thouaré-sur-Loire", codePostal: "44470", lat: 47.2769, lng: -1.4317 },
  { nom: "Mauves-sur-Loire", codePostal: "44470", lat: 47.2825, lng: -1.3875 },
  { nom: "Ancenis-Saint-Géréon", codePostal: "44150", lat: 47.3667, lng: -1.1769 },
  { nom: "Varades", codePostal: "44370", lat: 47.3842, lng: -1.0558 },
  { nom: "Clisson", codePostal: "44190", lat: 47.0884, lng: -1.2814 },
  { nom: "Vallet", codePostal: "44330", lat: 47.1608, lng: -1.2658 },
  { nom: "Nort-sur-Erdre", codePostal: "44390", lat: 47.4406, lng: -1.4994 },
  { nom: "Saint-Mars-la-Jaille", codePostal: "44540", lat: 47.5317, lng: -1.1786 },
  { nom: "Le Loroux-Bottereau", codePostal: "44430", lat: 47.2278, lng: -1.35 },
  { nom: "Basse-Goulaine", codePostal: "44115", lat: 47.2217, lng: -1.4783 },
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
