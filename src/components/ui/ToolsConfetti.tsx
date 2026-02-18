"use client";

interface ConfettiPiece {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  size: number;
  rotation: number;
  duration: number;
}

// Valeurs statiques pour éviter hydration mismatch (Math.random() SSR vs client)
const STATIC_PIECES: ConfettiPiece[] = [
  { id: 0, emoji: "🔨", x: 5, delay: 0.0, size: 1.4, rotation: 30, duration: 1.5 },
  { id: 1, emoji: "⚡", x: 12, delay: 0.1, size: 1.8, rotation: -60, duration: 1.3 },
  { id: 2, emoji: "🔧", x: 22, delay: 0.3, size: 1.2, rotation: 90, duration: 1.7 },
  { id: 3, emoji: "🪚", x: 31, delay: 0.5, size: 2.0, rotation: -120, duration: 1.4 },
  { id: 4, emoji: "🧱", x: 40, delay: 0.2, size: 1.5, rotation: 45, duration: 1.6 },
  { id: 5, emoji: "🔩", x: 50, delay: 0.4, size: 1.3, rotation: -30, duration: 1.9 },
  { id: 6, emoji: "🏗️", x: 58, delay: 0.6, size: 1.6, rotation: 150, duration: 1.2 },
  { id: 7, emoji: "📐", x: 67, delay: 0.1, size: 1.9, rotation: -90, duration: 1.8 },
  { id: 8, emoji: "✨", x: 74, delay: 0.7, size: 1.4, rotation: 60, duration: 1.3 },
  { id: 9, emoji: "🌟", x: 82, delay: 0.3, size: 2.0, rotation: -45, duration: 1.5 },
  { id: 10, emoji: "🔨", x: 90, delay: 0.5, size: 1.7, rotation: 120, duration: 1.4 },
  { id: 11, emoji: "⚡", x: 96, delay: 0.2, size: 1.3, rotation: -150, duration: 1.7 },
  { id: 12, emoji: "🔧", x: 8, delay: 0.6, size: 1.5, rotation: 75, duration: 1.6 },
  { id: 13, emoji: "🧱", x: 18, delay: 0.4, size: 1.2, rotation: -75, duration: 1.9 },
  { id: 14, emoji: "🪚", x: 27, delay: 0.7, size: 1.8, rotation: 105, duration: 1.3 },
  { id: 15, emoji: "📐", x: 36, delay: 0.0, size: 2.0, rotation: -105, duration: 1.5 },
  { id: 16, emoji: "✨", x: 45, delay: 0.3, size: 1.6, rotation: 15, duration: 1.4 },
  { id: 17, emoji: "🌟", x: 55, delay: 0.5, size: 1.4, rotation: -15, duration: 1.8 },
  { id: 18, emoji: "🔩", x: 63, delay: 0.1, size: 1.7, rotation: 165, duration: 1.2 },
  { id: 19, emoji: "🏗️", x: 78, delay: 0.4, size: 1.5, rotation: -165, duration: 1.6 },
];

export default function ToolsConfetti() {
  const pieces = STATIC_PIECES;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-5%",
            fontSize: `${p.size}rem`,
            animation: `bd-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
            userSelect: "none",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
