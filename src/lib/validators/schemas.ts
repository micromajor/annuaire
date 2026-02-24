import { z } from "zod";

export const feedbackSchema = z.object({
  type: z.enum(["BUG", "SUGGESTION", "AUTRE"]),
  message: z
    .string()
    .min(10, "Message trop court (10 caractères min)")
    .max(1000, "Message trop long (1000 caractères max)"),
  pageUrl: z.string().max(500).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

export const contactFormSchema = z.object({
  clientPrenom: z.string().min(2, "Prénom requis"),
  clientNom: z.string().min(2, "Nom requis"),
  clientEmail: z.string().email("Email invalide"),
  clientTel: z.string().optional(),
  message: z
    .string()
    .min(20, "Message trop court (20 caractères min)")
    .max(1000, "Message trop long (1000 caractères max)"),
  typeTraux: z.string().min(1, "Type de travaux requis"),
  photos: z.array(z.string().url()).max(6).optional(),
  consent: z.literal(true, {
    error: () => ({ message: "Vous devez accepter les conditions" }),
  }),
});

export const inscriptionArtisanSchema = z
  .object({
    raisonSociale: z.string().optional(),
    siret: z
      .string()
      .regex(/^\d{14}$/, "SIRET invalide (14 chiffres)")
      .optional()
      .or(z.literal("")),
    prenom: z.string().min(2, "Prénom requis"),
    nom: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    telephone: z.string().optional(),
    siteWeb: z.string().url("URL invalide").optional().or(z.literal("")),
    description: z.string().max(500, "Description trop longue (500 caractères max)").optional(),
    metierSlugs: z.array(z.string()),
    metierLibre: z
      .string()
      .max(80, "Métier trop long (80 caractères max)")
      .optional()
      .or(z.literal("")),
    communeIds: z.array(z.string()).min(1, "Au moins une commune requise"),
    consent: z.literal(true, {
      error: () => ({ message: "Vous devez accepter les conditions" }),
    }),
    password: z.string().min(8, "Mot de passe trop court (8 caractères min)").optional(),
  })
  .refine((d) => d.metierSlugs.length > 0 || !!d.metierLibre?.trim(), {
    message: "Au moins un métier requis (ou précisez le vôtre)",
    path: ["metierSlugs"],
  });

export const avisSchema = z.object({
  auteurPrenom: z.string().min(2, "Prénom requis (2 caractères min)"),
  auteurEmail: z.string().email("Email invalide"),
  note: z.number().int().min(1, "Note requise").max(5, "Note max 5"),
  commentaire: z
    .string()
    .min(20, "Commentaire trop court (20 caractères min)")
    .max(800, "Commentaire trop long (800 caractères max)"),
  consent: z.literal(true, {
    error: () => ({ message: "Vous devez accepter les conditions" }),
  }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type InscriptionArtisanData = z.infer<typeof inscriptionArtisanSchema>;
export type AvisData = z.infer<typeof avisSchema>;
