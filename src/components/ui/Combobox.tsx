"use client";

import { useState, useRef, useEffect, useId } from "react";

interface ComboboxOption {
  value: string;
  label: string;
  sub?: string; // texte secondaire (ex: code postal)
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string; // texte pour "pas de filtre" (ex: "Tous les métiers")
  label?: string; // label flottant au-dessus du champ
  className?: string;
  /** "default" = blanc avec bordure BD | "ghost" = fond transparent, soulignement seul */
  variant?: "default" | "ghost";
  /** Mode multi-sélection */
  multi?: boolean;
  values?: string[];
  onToggle?: (value: string) => void;
}

/** Normalise une chaîne : minuscules + sans accents */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Combobox({
  options,
  value,
  onChange,
  placeholder = "Rechercher…",
  allLabel,
  label,
  className = "",
  variant = "default",
  multi = false,
  values = [],
  onToggle,
}: ComboboxProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedLabel =
    value === "" ? "" : (options.find((o) => o.value === value)?.label ?? value);

  // Libellé affiché en mode multi
  const multiDisplayLabel = multi
    ? values.length === 0
      ? ""
      : values.length === 1
        ? (options.find((o) => o.value === values[0])?.label ?? values[0])
        : `${values.length} métiers`
    : "";

  // Filtre : inclusion normalisée — tolère les fautes partielles
  const nq = normalize(query);
  const filtered =
    nq === ""
      ? options
      : options.filter(
          (o) => normalize(o.label).includes(nq) || normalize(o.sub ?? "").includes(nq)
        );

  // Ferme en cliquant dehors
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Scroll automatique sur l'item highlighted
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function selectOption(val: string) {
    if (multi && onToggle) {
      if (val === "") {
        // "tout" → vide la sélection
        values.forEach((v) => onToggle(v));
      } else {
        onToggle(val);
      }
      setQuery("");
      // reste ouvert en multi
    } else {
      onChange(val);
      setQuery("");
      setOpen(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const total = (allLabel ? 1 : 0) + filtered.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const allItems = allLabel ? [{ value: "", label: allLabel }, ...filtered] : filtered;
      const item = allItems[highlighted];
      if (item) selectOption(item.value);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  const displayValue = open ? query : multi ? multiDisplayLabel : selectedLabel;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Champ */}
      <div
        className={
          variant === "ghost"
            ? "flex cursor-pointer items-center border-b-3 border-[#1a1a1a]/40 bg-transparent transition-colors hover:border-[#1a1a1a]"
            : "flex cursor-pointer items-center rounded-xl border-3 border-[#1a1a1a] bg-white"
        }
        style={variant === "default" ? { boxShadow: "3px 3px 0 #1a1a1a" } : undefined}
        onClick={() => {
          setOpen(true);
          setHighlighted(0);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <div className="relative flex-1">
          {label && (
            <span className="pointer-events-none absolute top-1.5 left-4 text-xs font-bold tracking-wide text-gray-400 uppercase">
              {label}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            type="text"
            autoComplete="off"
            value={displayValue}
            placeholder={open ? placeholder : selectedLabel || placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlighted(0);
            }}
            onFocus={() => {
              setOpen(true);
              setHighlighted(0);
            }}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent text-base font-bold text-[#1a1a2e] outline-none ${
              variant === "ghost"
                ? "placeholder:font-bold placeholder:text-[#1a1a2e]/40"
                : "placeholder:font-normal placeholder:text-gray-300"
            } ${label ? "pt-6 pr-4 pb-2 pl-4" : variant === "ghost" ? "px-2 py-2" : "px-4 py-3"}`}
          />
        </div>
        {/* Chevron / reset */}
        {(!multi && value) || (multi && values.length > 0) ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              selectOption("");
            }}
            className="pr-4 text-gray-400 hover:text-[#ff6b6b]"
            aria-label="Effacer"
          >
            ✕
          </button>
        ) : (
          <span
            className={`pointer-events-none ${variant === "ghost" ? "pr-1 text-[#1a1a2e]/40" : "pr-4 text-gray-400"}`}
          >
            ▼
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-[200] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border-3 border-[#1a1a1a] bg-white py-1 shadow-lg"
          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
        >
          {/* Option "tout" */}
          {allLabel && (
            <li
              role="option"
              aria-selected={value === ""}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                highlighted === 0
                  ? "bg-[#ffd93d] text-[#1a1a2e]"
                  : "text-gray-500 hover:bg-[#fff8f0]"
              }`}
              onMouseEnter={() => setHighlighted(0)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption("");
              }}
            >
              {value === "" && <span className="text-[#6bcb77]">✓</span>}
              {allLabel}
            </li>
          )}

          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 italic">Aucun résultat</li>
          )}

          {filtered.map((opt, idx) => {
            const i = (allLabel ? 1 : 0) + idx;
            const isSelected = multi ? values.includes(opt.value) : opt.value === value;
            const isHigh = i === highlighted;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  isHigh
                    ? "bg-[#ffd93d] text-[#1a1a2e]"
                    : isSelected
                      ? "bg-[#fff8f0] font-bold text-[#1a1a2e]"
                      : "text-[#1a1a2e] hover:bg-[#fff8f0]"
                }`}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(opt.value);
                }}
              >
                <span className="font-semibold">{opt.label}</span>
                <span className="flex items-center gap-2">
                  {opt.sub && <span className="text-xs text-gray-400">{opt.sub}</span>}
                  {isSelected && <span className="text-[#6bcb77]">✓</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
