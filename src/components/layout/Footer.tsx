import React from "react";

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border bg-background py-4 px-6 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
    </footer>
  );
}
