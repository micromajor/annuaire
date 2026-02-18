"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

interface AnimatedMetierCardProps {
  slug: string;
  label: string;
  emoji: string;
  index: number;
}

export default function AnimatedMetierCard({ slug, label, emoji, index }: AnimatedMetierCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/artisans?metier=${slug}`}
      className="bd-card flex flex-col items-center gap-2 p-4 text-center no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) rotate(0deg)" : "translateY(30px) rotate(-4deg)",
        transition: `opacity 0.4s ease ${index * 0.06}s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.06}s`,
      }}
    >
      <span
        className="text-3xl"
        style={{
          display: "inline-block",
          transform: hovered ? "rotate(-15deg) scale(1.3)" : "rotate(0deg) scale(1)",
          transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: hovered ? "drop-shadow(2px 2px 0px #1a1a1a)" : "none",
        }}
      >
        {emoji}
      </span>
      <span className="font-bold text-[#1a1a2e]">{label}</span>
    </Link>
  );
}
