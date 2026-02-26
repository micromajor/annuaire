import { PrismaClient, ArtisanStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { COMMUNES_NANTES_EST } from "../src/constants";

// Liste locale (METIERS supprimé de constants — DB-driven)
const METIERS = [
  // Gros œuvre & structure
  { slug: "macon", label: "Maçon", categorie: "Gros œuvre & structure" },
  { slug: "terrassier", label: "Terrassier", categorie: "Gros œuvre & structure" },
  { slug: "charpentier", label: "Charpentier", categorie: "Gros œuvre & structure" },
  { slug: "couvreur", label: "Couvreur", categorie: "Gros œuvre & structure" },
  { slug: "zingueur", label: "Zingueur", categorie: "Gros œuvre & structure" },
  { slug: "ravalement-facade", label: "Ravalement de façade", categorie: "Gros œuvre & structure" },
  // Second œuvre
  { slug: "plombier", label: "Plombier", categorie: "Second œuvre" },
  { slug: "electricien", label: "Électricien", categorie: "Second œuvre" },
  { slug: "chauffagiste", label: "Chauffagiste", categorie: "Second œuvre" },
  { slug: "peintre", label: "Peintre", categorie: "Second œuvre" },
  { slug: "menuisier", label: "Menuisier", categorie: "Second œuvre" },
  { slug: "plaquiste", label: "Plaquiste", categorie: "Second œuvre" },
  { slug: "carreleur", label: "Carreleur", categorie: "Second œuvre" },
  { slug: "parqueteur", label: "Parqueteur", categorie: "Second œuvre" },
  { slug: "vitrier", label: "Vitrier", categorie: "Second œuvre" },
  { slug: "serrurier", label: "Serrurier", categorie: "Second œuvre" },
  { slug: "poseur-isolation", label: "Poseur d'isolation", categorie: "Second œuvre" },
  { slug: "etancheur", label: "Étancheur", categorie: "Second œuvre" },
  // Menuiserie & fermetures
  { slug: "poseur-fenetres", label: "Poseur de fenêtres", categorie: "Menuiserie & fermetures" },
  {
    slug: "poseur-volets",
    label: "Poseur de volets & stores",
    categorie: "Menuiserie & fermetures",
  },
  { slug: "poseur-verandas", label: "Poseur de véranda", categorie: "Menuiserie & fermetures" },
  // Espaces extérieurs
  { slug: "paysagiste", label: "Paysagiste", categorie: "Espaces extérieurs" },
  {
    slug: "entretien-des-espaces-verts",
    label: "Entretien des espaces verts",
    categorie: "Espaces extérieurs",
  },
  { slug: "pisciniste", label: "Pisciniste", categorie: "Espaces extérieurs" },
  { slug: "paveur", label: "Paveur & dalleur", categorie: "Espaces extérieurs" },
  { slug: "cloturiste", label: "Clôturiste", categorie: "Espaces extérieurs" },
  {
    slug: "nettoyage-haute-pression",
    label: "Nettoyage haute pression",
    categorie: "Espaces extérieurs",
  },
  // Énergie & technique
  { slug: "climaticien", label: "Climaticien", categorie: "Énergie & technique" },
  { slug: "installateur-solaire", label: "Installateur solaire", categorie: "Énergie & technique" },
  { slug: "ramoneur", label: "Ramoneur", categorie: "Énergie & technique" },
  { slug: "domoticien", label: "Domoticien", categorie: "Énergie & technique" },
  // Aménagement intérieur
  { slug: "cuisiniste", label: "Cuisiniste", categorie: "Aménagement intérieur" },
  { slug: "tapissier", label: "Tapissier d'ameublement", categorie: "Aménagement intérieur" },
  {
    slug: "decorateur-interieur",
    label: "Décorateur d'intérieur",
    categorie: "Aménagement intérieur",
  },
  // Divers
  { slug: "travaux-divers", label: "Bricolage / Travaux divers", categorie: "Divers" },
];

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Début du seed...");

  // Métiers
  console.log("→ Insertion des métiers...");
  for (const metier of METIERS) {
    await prisma.metier.upsert({
      where: { slug: metier.slug },
      update: { label: metier.label, categorie: metier.categorie },
      create: { slug: metier.slug, label: metier.label, categorie: metier.categorie },
    });
  }

  // Communes
  console.log("→ Insertion des communes...");
  for (const commune of COMMUNES_NANTES_EST) {
    await prisma.commune.upsert({
      where: { nom_codePostal: { nom: commune.nom, codePostal: commune.codePostal } },
      update: {},
      create: { nom: commune.nom, codePostal: commune.codePostal },
    });
  }

  // Artisans de test
  console.log("→ Insertion des artisans...");

  const communeNantes = await prisma.commune.findFirstOrThrow({
    where: { nom: "Nantes" },
  });
  const communeSainteLuce = await prisma.commune.findFirstOrThrow({
    where: { nom: "Sainte-Luce-sur-Loire" },
  });
  const communeThouare = await prisma.commune.findFirstOrThrow({
    where: { nom: "Thouaré-sur-Loire" },
  });
  const communeVertou = await prisma.commune.findFirstOrThrow({
    where: { nom: "Vertou" },
  });
  const communeClisson = await prisma.commune.findFirstOrThrow({
    where: { nom: "Clisson" },
  });

  const metierPlombier = await prisma.metier.findUniqueOrThrow({
    where: { slug: "plombier" },
  });
  const metierElectricien = await prisma.metier.findUniqueOrThrow({
    where: { slug: "electricien" },
  });
  const metierMacon = await prisma.metier.findUniqueOrThrow({
    where: { slug: "macon" },
  });
  const metierPeintre = await prisma.metier.findUniqueOrThrow({
    where: { slug: "peintre" },
  });
  const metierMenuisier = await prisma.metier.findUniqueOrThrow({
    where: { slug: "menuisier" },
  });
  const metierCouvreur = await prisma.metier.findUniqueOrThrow({
    where: { slug: "couvreur" },
  });

  const artisans = [
    {
      prenom: "Jean-Pierre",
      nom: "Moreau",
      raisonSociale: "Moreau Plomberie",
      siret: "12345678901234",
      email: "jp.moreau@plomberie-nantes.fr",
      telephone: "06 12 34 56 78",
      description:
        "Plombier indépendant depuis 15 ans, spécialisé en rénovation salle de bain et dépannage urgent. Intervention sous 24h.",
      status: ArtisanStatus.VALIDE,
      metiers: [metierPlombier.id],
      communes: [communeNantes.id, communeSainteLuce.id],
    },
    {
      prenom: "Sophie",
      nom: "Leclerc",
      raisonSociale: "Élec Services Loire",
      siret: "23456789012345",
      email: "s.leclerc@elec-services.fr",
      telephone: "06 23 45 67 89",
      siteWeb: "https://elec-services-loire.fr",
      description:
        "Électricienne qualifiée (Qualifelec). Mise aux normes, installation tableau électrique, domotique. Devis gratuit.",
      status: ArtisanStatus.VALIDE,
      metiers: [metierElectricien.id],
      communes: [communeNantes.id, communeThouare.id, communeSainteLuce.id],
    },
    {
      prenom: "Bruno",
      nom: "Gauthier",
      raisonSociale: "Gauthier Maçonnerie",
      siret: "34567890123456",
      email: "b.gauthier@maconnerie44.fr",
      telephone: "07 34 56 78 90",
      description:
        "Maçon généraliste, travaux de gros œuvre, rénovation façade, création d'ouvertures. 20 ans d'expérience en Loire-Atlantique.",
      status: ArtisanStatus.VALIDE,
      metiers: [metierMacon.id],
      communes: [communeVertou.id, communeNantes.id],
    },
    {
      prenom: "Marie",
      nom: "Dupuis",
      raisonSociale: "Dupuis Peinture & Décoration",
      siret: "45678901234567",
      email: "m.dupuis@peinture-dupuis.fr",
      telephone: "06 45 67 89 01",
      description:
        "Peintre en bâtiment intérieur/extérieur. Spécialiste des effets décoratifs et enduits à la chaux. Travail soigné garanti.",
      status: ArtisanStatus.VALIDE,
      metiers: [metierPeintre.id],
      communes: [communeClisson.id, communeVertou.id],
    },
    {
      prenom: "Thomas",
      nom: "Renard",
      raisonSociale: "Renard Menuiserie",
      siret: "56789012345678",
      email: "t.renard@menuiserie-renard.fr",
      telephone: "06 56 78 90 12",
      siteWeb: "https://menuiserie-renard.fr",
      description:
        "Menuisier-ébéniste artisan. Fabrication sur mesure : escaliers, cuisines, dressings. Pose de fenêtres et portes.",
      status: ArtisanStatus.VALIDE,
      metiers: [metierMenuisier.id],
      communes: [communeThouare.id, communeSainteLuce.id, communeNantes.id],
    },
    {
      prenom: "Patrick",
      nom: "Leblanc",
      raisonSociale: "Couverture Leblanc",
      siret: "67890123456789",
      email: "p.leblanc@couverture-leblanc.fr",
      telephone: "06 67 89 01 23",
      description:
        "Couvreur-zingueur. Rénovation toiture, tuiles, ardoises, zinc. Traitement hydrofuge. Devis rapide.",
      status: ArtisanStatus.EN_ATTENTE,
      metiers: [metierCouvreur.id],
      communes: [communeNantes.id, communeClisson.id],
    },
  ];

  for (const data of artisans) {
    const { metiers, communes, ...artisanData } = data;

    const artisan = await prisma.artisan.upsert({
      where: { email: artisanData.email },
      update: {},
      create: {
        ...artisanData,
        metiers: {
          create: metiers.map((metierId) => ({ metierId })),
        },
        communes: {
          create: communes.map((communeId) => ({ communeId })),
        },
      },
    });

    console.log(`  ✓ ${artisan.prenom} ${artisan.nom} (${artisan.status})`);
  }

  console.log("✅ Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
