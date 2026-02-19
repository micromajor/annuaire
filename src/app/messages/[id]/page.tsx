"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Message {
  id: string;
  expediteur: string;
  contenu: string;
  createdAt: string;
  lu: boolean;
}

interface ConversationDetail {
  id: string;
  sujet: string;
  artisan: {
    id: string;
    prenom: string;
    nom: string;
    raisonSociale: string | null;
    logoUrl: string | null;
  };
  particulier: { id: string; prenom: string; nom: string };
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myRole, setMyRole] = useState<"artisan" | "particulier" | null>(null);
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (res.status === 401) {
      router.push("/connexion");
      return;
    }
    if (res.status === 403 || res.status === 404) {
      router.push("/messages");
      return;
    }
    const data = await res.json();
    setConversation(data.conversation);
    setMessages(data.messages);

    // Déterminer le rôle de l'utilisateur (premier appel)
    if (!myRole) {
      // On le déduira depuis la session via un mini endpoint ou en comparant avec les messages
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      setMyRole(session?.user?.role ?? null);
    }
  }, [id, router, myRole]);

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
    // Polling toutes les 5s
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll auto au dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!contenu.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu: contenu.trim() }),
      });
      if (res.ok) {
        setContenu("");
        await fetchMessages();
      }
    } finally {
      setSending(false);
    }
  }

  const nomArtisan = conversation
    ? (conversation.artisan.raisonSociale ??
      `${conversation.artisan.prenom} ${conversation.artisan.nom}`)
    : "…";

  return (
    <div className="flex h-screen flex-col bg-[#fff8f0]">
      {/* Header */}
      <header className="shrink-0 border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/messages"
            className="shrink-0 text-lg font-bold text-[#60c5f1] hover:opacity-80"
            aria-label="Retour"
          >
            ←
          </Link>
          {/* Avatar */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#fff8f0] text-base"
            style={{ border: "2px solid #60c5f1" }}
          >
            {conversation?.artisan.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.artisan.logoUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              "🔨"
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black text-white">{nomArtisan}</p>
            {conversation && (
              <p className="truncate text-xs text-[#60c5f1]/70">{conversation.sujet}</p>
            )}
          </div>
        </div>
      </header>

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {loading ? (
            <p className="py-20 text-center font-bold text-gray-400">Chargement…</p>
          ) : messages.length === 0 ? (
            <p className="py-20 text-center font-bold text-gray-400">Aucun message.</p>
          ) : (
            messages.map((m) => {
              const isMine = m.expediteur === myRole;
              const time = new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const date = new Date(m.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              });
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl border-3 border-[#1a1a1a] px-4 py-2.5 ${
                      isMine
                        ? "rounded-br-sm bg-[#1a1a2e] text-white"
                        : "rounded-bl-sm bg-white text-[#1a1a2e]"
                    }`}
                    style={{ boxShadow: isMine ? "3px 3px 0 #60c5f1" : "3px 3px 0 #1a1a1a" }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.contenu}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${isMine ? "text-white/50" : "text-gray-400"}`}
                    >
                      {date} {time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Zone saisie */}
      <div className="shrink-0 border-t-4 border-[#1a1a1a] bg-white px-4 py-3">
        <form onSubmit={handleSend} className="mx-auto flex max-w-2xl items-end gap-3">
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Votre message…"
            rows={2}
            maxLength={2000}
            className="flex-1 resize-none rounded-xl border-3 border-[#1a1a1a] bg-[#fff8f0] px-3 py-2 text-sm font-medium text-[#1a1a2e] placeholder-gray-400 focus:ring-2 focus:ring-[#60c5f1] focus:outline-none"
            style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
          />
          <button
            type="submit"
            disabled={sending || !contenu.trim()}
            className="shrink-0 rounded-xl border-3 border-[#1a1a1a] bg-[#1a1a2e] px-4 py-2.5 text-sm font-black text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
          >
            {sending ? "⏳" : "Envoyer ✉️"}
          </button>
        </form>
        <p className="mt-1 text-center text-[10px] text-gray-400">
          Entrée pour envoyer · Maj+Entrée pour sauter une ligne
        </p>
      </div>
    </div>
  );
}
