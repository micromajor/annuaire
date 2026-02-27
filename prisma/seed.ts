import { PrismaClient } from "@prisma/client";
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
