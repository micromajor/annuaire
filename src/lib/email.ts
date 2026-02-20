import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail({
  destinataireEmail,
  resetToken,
}: {
  destinataireEmail: string;
  resetToken: string;
}) {
  const lien = `${APP_URL}/connexion/reset/${resetToken}`;

  try {
    await resend.emails.send({
      from: `OyezArtisans <${FROM}>`,
      to: destinataireEmail,
      subject: `🔑 Réinitialisation de votre mot de passe`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fff8f0;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:3px solid #1a1a2e;border-radius:12px;overflow:hidden;max-width:100%;">
        <tr>
          <td style="background:#1a1a2e;padding:20px 28px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#ffd93d;letter-spacing:-0.5px;">Oyez Artisans !</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 8px;font-size:16px;color:#1a1a2e;">Bonjour,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#444;">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>
            <a href="${lien}" style="display:inline-block;background:#ffd93d;color:#1a1a2e;font-weight:900;font-size:15px;padding:12px 24px;border-radius:8px;border:2px solid #1a1a2e;text-decoration:none;box-shadow:3px 3px 0 #1a1a2e;">
              Réinitialiser mon mot de passe →
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#999;">Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:2px solid #f0e8d8;">
            <p style="margin:0;font-size:12px;color:#999;">OyezArtisans · <a href="${APP_URL}" style="color:#1a1a2e;">${APP_URL}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (err) {
    console.error("[email] Échec reset password:", err);
  }
}

export async function sendNouveauMessageEmail({
  destinataireEmail,
  destinataireNom,
  expediteurNom,
  conversationId,
  apercu,
}: {
  destinataireEmail: string;
  destinataireNom: string;
  expediteurNom: string;
  conversationId: string;
  apercu: string;
}) {
  const lien = `${APP_URL}/messages/${conversationId}`;
  const apercuTronque = apercu.length > 120 ? apercu.slice(0, 120) + "…" : apercu;

  try {
    await resend.emails.send({
      from: `OyezArtisans <${FROM}>`,
      to: destinataireEmail,
      subject: `💬 Nouveau message de ${expediteurNom}`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fff8f0;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:3px solid #1a1a2e;border-radius:12px;overflow:hidden;max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a2e;padding:20px 28px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#ffd93d;letter-spacing:-0.5px;">Oyez Artisans !</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 8px;font-size:16px;color:#1a1a2e;">Bonjour <strong>${destinataireNom}</strong>,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#444;">Vous avez reçu un nouveau message de <strong>${expediteurNom}</strong>&nbsp;:</p>
            <!-- Aperçu message -->
            <div style="background:#fff8f0;border-left:4px solid #ffd93d;border-radius:4px;padding:14px 16px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#333;font-style:italic;">"${apercuTronque}"</p>
            </div>
            <!-- CTA -->
            <a href="${lien}" style="display:inline-block;background:#ffd93d;color:#1a1a2e;font-weight:900;font-size:15px;padding:12px 24px;border-radius:8px;border:2px solid #1a1a2e;text-decoration:none;box-shadow:3px 3px 0 #1a1a2e;">
              Répondre au message →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;border-top:2px solid #f0e8d8;">
            <p style="margin:0;font-size:12px;color:#999;">Vous recevez cet email car vous êtes inscrit sur OyezArtisans. Connectez-vous sur <a href="${APP_URL}" style="color:#1a1a2e;">${APP_URL}</a> pour gérer vos messages.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (err) {
    // Non bloquant — l'envoi du message réussit même si l'email échoue
    console.error("[email] Échec notification:", err);
  }
}
