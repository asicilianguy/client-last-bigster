// ============================================
// FILE: components/ui/SearchableSelect.tsx
// Componente riutilizzabile per select con ricerca
// ============================================

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  label?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Cerca...",
  emptyLabel = "Tutti",
  label,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtra opzioni in base alla ricerca
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Trova l'opzione selezionata
  const selectedOption = options.find((opt) => opt.value === value);

  // Chiudi dropdown quando clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-sm font-semibold text-bigster-text block mb-2">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputBase} flex items-center justify-between cursor-pointer hover:bg-bigster-background transition-colors`}
      >
        <span
          className={
            selectedOption ? "text-bigster-text" : "text-bigster-text-muted"
          }
        >
          {selectedOption ? selectedOption.label : emptyLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-bigster-text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-bigster-surface border border-bigster-border shadow-lg max-h-80 overflow-hidden flex flex-col"
          style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-bigster-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className={`${inputBase} pl-10 pr-8`}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bigster-text-muted hover:text-bigster-text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {/* Opzione "Tutti" */}
            <button
              type="button"
              onClick={() => handleSelect("all")}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === "all"
                  ? "bg-bigster-primary text-bigster-primary-text font-semibold"
                  : "text-bigster-text hover:bg-bigster-background"
              }`}
            >
              {emptyLabel}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-bigster-text-muted">
                Nessun risultato trovato
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === option.value
                      ? "bg-bigster-primary text-bigster-primary-text font-semibold"
                      : "text-bigster-text hover:bg-bigster-background"
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
