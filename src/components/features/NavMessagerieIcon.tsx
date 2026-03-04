"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NavMessagerieIcon() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [msgCount, setMsgCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    if (!["artisan", "particulier"].includes(role ?? "")) return;

    const fetchCount = async (): Promise<void> => {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setMsgCount(data.count ?? 0);
          setContactCount(data.contacts ?? 0);
        }
      } catch {
        // silencieux
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [role]);

  if (!["artisan", "particulier"].includes(role ?? "")) return null;

  const total = msgCount + contactCount;

  return (
    <div className="flex items-center gap-2">
      {/* Icône messages */}
      <Link
        href="/messages"
        className="relative flex items-center justify-center rounded-xl border-2 border-[#1a1a2e]/40 p-2 text-[#1a1a2e] transition-colors hover:bg-[#1a1a2e]/10"
        aria-label={`Messages${msgCount > 0 ? ` (${msgCount} non lu${msgCount > 1 ? "s" : ""})` : ""}`}
        title="Messages"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {msgCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#ff6b6b] px-1 text-[10px] font-black text-white"
            style={{ border: "2px solid #1a1a2e" }}
          >
            {msgCount > 9 ? "9+" : msgCount}
          </span>
        )}
      </Link>

      {/* Icône demandes de contact (artisans uniquement) */}
      {role === "artisan" && (
        <Link
          href="/mon-espace"
          className="relative flex items-center justify-center rounded-xl border-2 border-[#1a1a2e]/40 p-2 text-[#1a1a2e] transition-colors hover:bg-[#1a1a2e]/10"
          aria-label={`Demandes${contactCount > 0 ? ` (${contactCount} nouvelle${contactCount > 1 ? "s" : ""})` : ""}`}
          title="Demandes de contact"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {contactCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#ffd93d] px-1 text-[10px] font-black text-[#1a1a2e]"
              style={{ border: "2px solid #1a1a2e" }}
            >
              {contactCount > 9 ? "9+" : contactCount}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}
