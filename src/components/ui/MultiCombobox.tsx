"use client";

import { useState, useRef, useEffect, useId } from "react";

interface MultiComboboxOption {
  value: string;
  label: string;
  sub?: string;
}

interface MultiComboboxProps {
  options: MultiComboboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  allLabel?: string;
  label?: string;
  className?: string;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function MultiCombobox({
  options,
  values,
  onChange,
  placeholder = "Rechercher…",
  allLabel = "Tous",
  label,
  className = "",
}: MultiComboboxProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const nq = normalize(query);
  const filtered = nq === "" ? options : options.filter((o) => normalize(o.label).includes(nq));

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

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function toggleOption(val: string) {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
    setQuery("");
    inputRef.current?.focus();
  }

  function removeValue(val: string) {
    onChange(values.filter((v) => v !== val));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const total = 1 + filtered.length; // 1 = "Tous"
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted === 0) {
        onChange([]);
      } else {
        const item = filtered[highlighted - 1];
        if (item) toggleOption(item.value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    } else if (e.key === "Backspace" && query === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  const selectedLabels = values.map((v) => options.find((o) => o.value === v)?.label ?? v);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Champ */}
      <div
        className="flex min-h-[52px] cursor-pointer flex-wrap items-center gap-1.5 rounded-xl border-3 border-[#1a1a1a] bg-white px-3 py-2"
        style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
        onClick={() => {
          setOpen(true);
          setHighlighted(0);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {label && values.length === 0 && !open && (
          <span className="pointer-events-none absolute top-1.5 left-4 text-xs font-bold tracking-wide text-gray-400 uppercase">
            {label}
          </span>
        )}

        {/* Badges des sélections */}
        {selectedLabels.map((lbl, i) => (
          <span
            key={values[i]}
            className="flex items-center gap-1 rounded-lg border-2 border-[#1a1a2e] bg-[#ffd93d] px-2 py-0.5 text-xs font-bold text-[#1a1a2e]"
          >
            {lbl}
            <button
              type="button"
              className="ml-0.5 text-[#1a1a2e]/60 hover:text-[#ff6b6b]"
              onMouseDown={(e) => {
                e.stopPropagation();
                removeValue(values[i]);
              }}
              aria-label={`Supprimer ${lbl}`}
            >
              ✕
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          value={query}
          placeholder={values.length === 0 ? (label ?? placeholder) : ""}
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
          className={`min-w-[80px] flex-1 bg-transparent text-base font-bold text-[#1a1a2e] outline-none placeholder:font-normal placeholder:text-gray-300 ${
            values.length > 0 ? "py-0.5" : "px-1 py-1"
          }`}
        />

        {/* Reset tout */}
        {values.length > 0 ? (
          <button
            type="button"
            onMouseDown={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="ml-auto shrink-0 text-gray-400 hover:text-[#ff6b6b]"
            aria-label="Tout effacer"
          >
            ✕
          </button>
        ) : (
          <span className="pointer-events-none ml-auto shrink-0 pr-1 text-gray-400">▼</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-[200] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border-3 border-[#1a1a1a] bg-white py-1 shadow-lg"
          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
        >
          {/* Option "Tous" */}
          <li
            role="option"
            aria-selected={values.length === 0}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors ${
              highlighted === 0 ? "bg-[#ffd93d] text-[#1a1a2e]" : "text-gray-500 hover:bg-[#fff8f0]"
            }`}
            onMouseEnter={() => setHighlighted(0)}
            onMouseDown={(e) => {
              e.preventDefault();
              onChange([]);
              setOpen(false);
            }}
          >
            {values.length === 0 && <span className="text-[#6bcb77]">✓</span>}
            {allLabel}
          </li>

          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 italic">Aucun résultat</li>
          )}

          {filtered.map((opt, idx) => {
            const i = 1 + idx;
            const isSelected = values.includes(opt.value);
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
                  toggleOption(opt.value);
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
