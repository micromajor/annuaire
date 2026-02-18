"use client";

import { signOut } from "next-auth/react";

export default function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="bd-btn bd-btn-outline text-sm text-white hover:bg-white hover:text-[#1a1a2e]"
    >
      Déconnexion
    </button>
  );
}
