import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

// Extraire le type du client de transaction depuis la signature de $transaction
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const UpdateProfileSchema = z.object({
  prenom: z.string().min(1, "Prénom requis").max(100),
  nom: z.string().min(1, "Nom requis").max(100),
  raisonSociale: z.string().max(200).optional().or(z.literal("")),
  telephone: z.string().max(20).optional().or(z.literal("")),
  siret: z
    .string()
    .regex(/^\d{14}$/, "SIRET invalide (14 chiffres)")
    .optional()
    .or(z.literal("")),
  siteWeb: z.string().url("URL invalide").max(300).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  logoUrl: z
    .string()
    .max(500)
    .refine(
      (v) => v === "" || v.startsWith("/api/files/") || /^https?:\/\//.test(v),
      "URL de logo invalide"
    )
    .optional()
    .or(z.literal("")),
  metierSlugs: z.array(z.string()).min(1, "Au moins un métier requis"),
  communeNoms: z.array(z.string()).min(1, "Au moins une commune requise"),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  const artisanId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!artisanId || role !== "artisan") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UpdateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const {
    prenom,
    nom,
    raisonSociale,
    telephone,
    siret,
    siteWeb,
    description,
    logoUrl,
    metierSlugs,
    communeNoms,
  } = parsed.data;

  // Résoudre les métiers
  const metiers = await prisma.metier.findMany({
    where: { slug: { in: metierSlugs } },
  });

  // Résoudre les communes
  const communes = await prisma.commune.findMany({
    where: { nom: { in: communeNoms } },
  });

  // Mise à jour en transaction
  const updated = await prisma.$transaction(async (tx: TxClient) => {
    // Supprimer les anciennes liaisons
    await tx.artisanMetier.deleteMany({ where: { artisanId } });
    await tx.artisanCommune.deleteMany({ where: { artisanId } });

    const current = await tx.artisan.findUnique({
      where: { id: artisanId },
      select: { status: true },
    });

    // Si déjà validé, repasser en attente pour re-validation
    const newStatus = current?.status === "VALIDE" ? "EN_ATTENTE" : current?.status;

    return tx.artisan.update({
      where: { id: artisanId },
      data: {
        prenom,
        nom,
        raisonSociale: raisonSociale || null,
        telephone: telephone || null,
        siret: siret || null,
        siteWeb: siteWeb || null,
        description: description || null,
        logoUrl: logoUrl || null,
        status: newStatus,
        metiers: {
          create: metiers.map((m: { id: string }) => ({ metierId: m.id })),
        },
        communes: {
          create: communes.map((c: { id: string }) => ({ communeId: c.id })),
        },
      },
    });
  });

  return NextResponse.json({ ok: true, artisanId: updated.id });
}
