import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: "postgresql://postgres:postgres@localhost:5432/annuaire_artisans" });
const p = new PrismaClient({ adapter });
const r = await p.artisan.findMany({
  where: { status: "VALIDE", deletedAt: null },
  select: { id: true, raisonSociale: true, prenom: true, nom: true },
  take: 5,
});
console.log(JSON.stringify(r, null, 2));
await p.$disconnect();
