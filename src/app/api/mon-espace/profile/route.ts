import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Extraire le type du client de transaction depuis la signature de $transaction
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const UpdateProfileSchema = z
  .object({
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
    accroche: z.string().max(200).optional().or(z.literal("")),
    logoUrl: z
      .string()
      .max(500)
      .refine(
        (v) => v === "" || v.startsWith("/api/files/") || /^https?:\/\//.test(v),
        "URL de logo invalide"
      )
      .optional()
      .or(z.literal("")),
    metierSlugs: z.array(z.string()).default([]),
    metierLibre: z.string().max(80).optional().or(z.literal("")),
    communePairs: z
      .array(z.object({ nom: z.string(), codePostal: z.string() }))
      .min(1, "Au moins une commune requise"),
  })
  .refine((d) => d.metierSlugs.length > 0 || !!d.metierLibre?.trim(), {
    message: "Au moins un métier requis (ou précisez le vôtre)",
    path: ["metierSlugs"],
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
    accroche,
    logoUrl,
    metierSlugs,
    metierLibre,
    communePairs,
  } = parsed.data;

  // Résoudre les métiers
  const metiers = await prisma.metier.findMany({
    where: { slug: { in: metierSlugs } },
  });

  // Upsert des communes (crée automatiquement les communes inconnues de la DB)
  const communes = await Promise.all(
    communePairs.map((pair) =>
      prisma.commune.upsert({
        where: { nom_codePostal: { nom: pair.nom, codePostal: pair.codePostal } },
        create: { nom: pair.nom, codePostal: pair.codePostal },
        update: {},
      })
    )
  );

  // Mise à jour en transaction
  const updated = await prisma.$transaction(async (tx: TxClient) => {
    const current = await tx.artisan.findUnique({
      where: { id: artisanId },
      select: { status: true },
    });

    // Si la fiche est déjà en ligne (VALIDE) → draft en attente, ne pas toucher aux données live
    if (current?.status === "VALIDE") {
      return tx.artisan.update({
        where: { id: artisanId },
        data: {
          hasPendingDraft: true,
          draftData: {
            prenom,
            nom,
            raisonSociale: raisonSociale || null,
            telephone: telephone || null,
            siret: siret || null,
            siteWeb: siteWeb || null,
            description: description || null,
            accroche: accroche || null,
            logoUrl: logoUrl || null,
            metierSlugs,
            metierLibre: metierLibre || null,
            communePairs, // { nom, codePostal }[] — pour la validation admin
            // labels pour l'affichage diff
            metierLabels: metiers.map((m: { label: string }) => m.label),
            communeLabels: communePairs.map((p) => p.nom),
          },
        },
      });
    }

    // Sinon (EN_ATTENTE, REJETE) → écraser directement, la fiche n'est pas live
    // Si c'était REJETE, on repasse en EN_ATTENTE pour re-soumettre à validation.
    // NOTE: PrismaPg + composite @@id → nested creates échouent silencieusement.
    // Pattern: deleteMany + update scalaires + creates séparés.
    await tx.artisanMetier.deleteMany({ where: { artisanId } });
    await tx.artisanCommune.deleteMany({ where: { artisanId } });

    const updatedArtisan = await tx.artisan.update({
      where: { id: artisanId },
      data: {
        prenom,
        nom,
        raisonSociale: raisonSociale || null,
        telephone: telephone || null,
        siret: siret || null,
        siteWeb: siteWeb || null,
        description: description || null,
        accroche: accroche || null,
        logoUrl: logoUrl || null,
        metierLibre: metierLibre || null,
        // Remet en attente si la fiche était rejetée
        ...(current?.status === "REJETE" ? { status: "EN_ATTENTE" } : {}),
      },
    });

    for (const m of metiers) {
      await tx.artisanMetier.create({ data: { artisanId, metierId: m.id } });
    }
    for (const c of communes) {
      await tx.artisanCommune.create({ data: { artisanId, communeId: c.id } });
    }

    return updatedArtisan;
  });

  // Notification admin si l'artisan re-soumet après rejet
  if (updated.status === "EN_ATTENTE" && resend) {
    const adminEmail = process.env.ADMIN_EMAIL ?? "contact@oyezartisans.fr";
    const nomAffiche = updated.raisonSociale ?? `${updated.prenom} ${updated.nom}`;
    const metierLabels = metiers.map((m: { label: string }) => m.label).join(", ");
    await resend.emails
      .send({
        from: "OyezArtisans <noreply@oyezartisans.fr>",
        to: adminEmail,
        subject: `🔄 Fiche corrigée en attente de validation : ${nomAffiche}`,
        html: `
        <h2>Fiche artisan corrigée — nouvelle demande de validation</h2>
        <p>L'artisan <strong>${nomAffiche}</strong> a modifié sa fiche suite à un rejet et la resoumet à validation.</p>
        <ul>
          <li><strong>Email :</strong> ${updated.email}</li>
          ${updated.telephone ? `<li><strong>Tél :</strong> ${updated.telephone}</li>` : ""}
          <li><strong>Métiers :</strong> ${metierLabels || "(aucun)"}</li>
          ${updated.metierLibre ? `<li><strong>Métier libre :</strong> ${updated.metierLibre}</li>` : ""}
          <li><strong>Communes :</strong> ${communes.map((c: { nom: string }) => c.nom).join(", ")}</li>
        </ul>
        <p><a href="${process.env.NEXTAUTH_URL ?? "https://oyezartisans.fr"}/admin">Valider depuis le back-office →</a></p>
      `,
      })
      .catch(() => null); // non-bloquant
  }

  return NextResponse.json({ ok: true, artisanId: updated.id });
}
