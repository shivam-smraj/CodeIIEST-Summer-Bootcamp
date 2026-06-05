import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export function CustomSelect({ options, value, onChange, disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-[#0d0e11] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white flex items-center justify-between text-left transition-all duration-200 focus:outline-none ${
          disabled
            ? 'opacity-40 cursor-not-allowed text-white/30'
            : 'cursor-pointer hover:border-white/20 focus:border-white/30 focus:ring-2 focus:ring-white/10'
        } ${isOpen ? 'border-white/25 ring-2 ring-white/10' : ''}`}
      >
        <span className="truncate text-[14px] text-white/90">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-white/30 shrink-0 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#14151b] border border-white/[0.12] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 max-h-60 overflow-y-auto py-1.5 backdrop-blur-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center justify-between transition-colors ${
                value === option.value
                  ? 'bg-white/[0.06] text-white font-semibold'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-3.5 h-3.5 text-white/60" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
