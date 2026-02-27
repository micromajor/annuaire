import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { sendEmailVerification, sendAdminNouvelleInscription } from "@/lib/email";
import crypto from "crypto";

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
    metierSlugs: z.array(z.string()).min(1, "Au moins un métier requis"),
    metierLibre: z.string().max(80).optional().or(z.literal("")),
    communePairs: z
      .array(z.object({ nom: z.string(), codePostal: z.string() }))
      .min(1, "Au moins une commune requise"),
  })
  .refine((d) => d.metierSlugs.length > 0, {
    message: "Au moins un métier requis",
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

  // Détecter une première soumission (artisan sans métier jusqu'ici)
  const currentArtisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: {
      status: true,
      email: true,
      prenom: true,
      passwordHash: true,
      metiers: { take: 1, select: { metierId: true } },
    },
  });
  // isFirstSubmission : 1ère fois que l'artisan email/password soumet un métier
  const isFirstSubmission =
    (currentArtisan?.metiers.length ?? 0) === 0 &&
    currentArtisan?.status === "EN_ATTENTE" &&
    !!currentArtisan?.passwordHash;

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
    // Toujours écraser directement. Si la fiche était REJETE, on repasse EN_ATTENTE.
    // NOTE: PrismaPg + composite @@id → nested creates échouent silencieusement.
    // Pattern: deleteMany + update scalaires + creates séparés.
    await tx.artisanMetier.deleteMany({ where: { artisanId } });
    await tx.artisanCommune.deleteMany({ where: { artisanId } });

    const current = await tx.artisan.findUnique({
      where: { id: artisanId },
      select: { status: true },
    });

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
        // Re-soumission après rejet → auto-VALIDE (plus de validation manuelle)
        ...(current?.status === "REJETE" ? { status: "VALIDE" } : {}),
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

  const nomAffiche = updated.raisonSociale ?? `${updated.prenom} ${updated.nom}`;
  const metierLabels = metiers.map((m: { label: string }) => m.label).join(", ");
  const communeNoms = communes.map((c: { nom: string }) => c.nom).join(", ");

  if (isFirstSubmission) {
    // 1ère soumission email/password : générer token + envoyer lien de vérification + notifier admin
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.artisan.update({
      where: { id: artisanId },
      data: { emailVerificationToken: verificationToken },
    });
    await Promise.allSettled([
      sendEmailVerification({
        destinataireEmail: updated.email,
        prenomArtisan: updated.prenom || nomAffiche,
        token: verificationToken,
      }),
      sendAdminNouvelleInscription({
        nomArtisan: nomAffiche,
        emailArtisan: updated.email,
        metierLabels: metierLabels || "(aucun)",
        communeNoms: communeNoms || "(aucune)",
        artisanId: updated.id,
      }),
    ]);
  } else if (currentArtisan?.status === "REJETE") {
    // Re-soumission après rejet : auto-VALIDE (fait en transaction), juste notifier l'admin
    const APP_URL = process.env.NEXTAUTH_URL ?? "https://oyezartisans.fr";
    const adminEmail = process.env.ADMIN_EMAIL ?? "contact@oyezartisans.fr";
    const { Resend } = await import("resend");
    const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (resendClient) {
      await resendClient.emails
        .send({
          from: `OyezArtisans <${process.env.EMAIL_FROM ?? "onboarding@resend.dev"}>`,
          to: adminEmail,
          subject: `🔄 Fiche corrigée et remise en ligne : ${nomAffiche}`,
          html: `
          <h2>Fiche artisan corrigée — remise en ligne automatiquement</h2>
          <p>L'artisan <strong>${nomAffiche}</strong> a corrigé sa fiche suite à un rejet. Elle est maintenant <strong>en ligne</strong>.</p>
          <ul>
            <li><strong>Email :</strong> ${updated.email}</li>
            ${updated.telephone ? `<li><strong>Tél :</strong> ${updated.telephone}</li>` : ""}
            <li><strong>Métiers :</strong> ${metierLabels || "(aucun)"}</li>
            ${updated.metierLibre ? `<li><strong>Métier libre :</strong> ${updated.metierLibre}</li>` : ""}
            <li><strong>Communes :</strong> ${communeNoms}</li>
          </ul>
          <p style="font-size:12px;color:#999;">Vous pouvez la rejeter à nouveau depuis le back-office si nécessaire.</p>
          <p><a href="${APP_URL}/admin">Accéder au back-office →</a></p>
        `,
        })
        .catch(() => null);
    }
  }

  return NextResponse.json({ ok: true, artisanId: updated.id, firstSubmission: isFirstSubmission });
}
