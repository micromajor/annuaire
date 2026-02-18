"use client";

interface FloatingTool {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

// Génération statique côté serveur (pas de randomness sur le client pour éviter l'hydration mismatch)
const STATIC_TOOLS: FloatingTool[] = [
  { id: 0, emoji: "🔨", x: 62, delay: 0.5, duration: 5.2, size: 2.1, rotation: -15 },
  { id: 1, emoji: "🪚", x: 72, delay: 1.8, duration: 4.4, size: 1.7, rotation: 25 },
  { id: 2, emoji: "⚡", x: 80, delay: 0.2, duration: 6.0, size: 2.4, rotation: -28 },
  { id: 3, emoji: "🔧", x: 68, delay: 2.5, duration: 4.8, size: 1.5, rotation: 40 },
  { id: 4, emoji: "🧱", x: 88, delay: 1.1, duration: 5.6, size: 2.0, rotation: -5 },
  { id: 5, emoji: "📐", x: 75, delay: 3.0, duration: 4.2, size: 1.8, rotation: 18 },
];

export default function FloatingTools() {
  const tools = STATIC_TOOLS;

  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      aria-hidden="true"
    >
      {tools.map((tool) => (
        <span
          key={tool.id}
          style={{
            position: "absolute",
            left: `${tool.x}%`,
            top: "-10%",
            fontSize: `${tool.size}rem`,
            animation: `bd-float ${tool.duration}s ease-in-out ${tool.delay}s infinite alternate`,
            transform: `rotate(${tool.rotation}deg)`,
            opacity: 0.35,
            filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.3))",
            userSelect: "none",
          }}
        >
          {tool.emoji}
        </span>
      ))}
    </div>
  );
}
