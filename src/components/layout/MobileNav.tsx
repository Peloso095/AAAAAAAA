import React from "react";

export function MobileNav(): JSX.Element {
  return (
    <nav className="lg:hidden fixed inset-x-0 top-0 z-40 h-16 bg-background border-b border-border flex items-center px-4">
      <button aria-label="Abrir menu" className="p-2">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <a href="/" className="ml-3 text-sm font-semibold">Início</a>

      <div className="ml-auto flex items-center gap-3">
        <button aria-label="Pesquisar" className="p-2">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">U</div>
      </div>
    </nav>
  );
}