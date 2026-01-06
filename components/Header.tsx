
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { Languages, ChevronDown } from 'lucide-react';

interface Props {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

const Header: React.FC<Props> = ({ currentLang, onLangChange }) => {
  const t = translations[currentLang];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    onLangChange(lang);
    setIsOpen(false);
  };

  const languages: Language[] = ['pt', 'en', 'es'];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-6 pb-4 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-xl mx-auto px-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          
          {/* Language Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
                isOpen 
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-md' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Languages size={14} className={isOpen ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{currentLang}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-24 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 animate-in fade-in zoom-in-95 duration-150 z-50 overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleSelect(l)}
                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      currentLang === l 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {l === 'pt' ? 'Português' : l === 'en' ? 'English' : 'Español'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse opacity-50" />
        </div>
        
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {currentLang === 'pt' ? 'Alavancas' : currentLang === 'en' ? 'Levers' : 'Palancas'}
        </h1>
        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest">
          {t.header_subtitle}
        </p>
      </div>
    </header>
  );
};

export default Header;
