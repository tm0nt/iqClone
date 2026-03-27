"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type SelectOption = {
  id: string;
  label: string;
};

interface AccountInlineSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AccountInlineSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
}: AccountInlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-black px-4 py-3 text-left text-white transition-all duration-200 focus:outline-none focus:bg-[#050505] focus:ring-1 focus:ring-white/12"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={`text-sm ${selectedOption ? "text-white" : "text-white/42"}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-black shadow-2xl">
          {options.map((option) => {
            const isSelected = option.id === value;

            return (
              <button
                key={option.id}
                type="button"
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 ${
                  isSelected
                    ? "bg-white/[0.08] text-white"
                    : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                }`}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
