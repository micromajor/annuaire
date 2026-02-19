"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NavMessagerieIcon() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!["artisan", "particulier"].includes(role ?? "")) return;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
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

  return (
    <Link
      href="/messages"
      className="relative flex items-center justify-center rounded-xl border-2 border-[#ffd93d]/40 p-2 text-[#ffd93d] transition-colors hover:bg-[#ffd93d]/10"
      aria-label="Messages"
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
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#ff6b6b] px-1 text-[10px] font-black text-white"
          style={{ border: "2px solid #1a1a2e" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
