// ============================================
// FILE: components/ui/StandardSelect.tsx
// Select standard con dropdown custom (senza ricerca)
// ============================================

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm";

interface StandardSelectOption {
  value: string;
  label: string;
}

interface StandardSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StandardSelectOption[];
  emptyLabel?: string;
  label?: string;
}

export function StandardSelect({
  value,
  onChange,
  options,
  emptyLabel = "Tutti",
  label,
}: StandardSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
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
        className={`${inputBase} flex items-center justify-between cursor-pointer transition-colors appearance-none`}
        style={{
          textAlign: "left",
        }}
      >
        <span
          className={
            selectedOption ? "text-bigster-text" : "text-bigster-text-muted"
          }
        >
          {selectedOption ? selectedOption.label : emptyLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-bigster-text-muted transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-bigster-surface border border-bigster-border shadow-lg max-h-80 overflow-y-auto"
          style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
        >
          {/* Opzione "Tutti" / Empty */}
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

          {/* Options list */}
          {options.map((option) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
