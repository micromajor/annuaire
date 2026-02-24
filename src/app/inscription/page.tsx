import { redirect } from "next/navigation";

export default function InscriptionPage() {
  redirect("/connexion?callbackUrl=/mon-espace");
}
