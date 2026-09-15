"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["Início", "/"],
  ["Aprender", "/aprender"],
  ["Problemas", "/problemas"],
  ["Resolver", "/resolver"],
  ["Sobre", "/sobre"],
] as const;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-black text-white">
      <div className="container-page flex min-h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight" onClick={() => setOpen(false)}>
          <span className="h-3 w-3 rotate-45 bg-[#80FFF6]" aria-hidden="true" />
          SIMPLEXLAB
        </Link>
        <button
          className="rounded-lg border border-white/25 px-3 py-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Abrir menu de navegação"
        >
          Menu
        </button>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`rounded-lg px-3 py-2 text-sm ${active ? "bg-[#80FFF6] text-black" : "text-white/80 hover:text-white"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      {open && (
        <nav className="container-page grid gap-1 border-t border-white/10 py-3 md:hidden" aria-label="Navegação mobile">
          {links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`rounded-lg px-3 py-2 ${active ? "bg-[#80FFF6] text-black" : "hover:bg-white/10"}`} onClick={() => setOpen(false)}>
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
