import Link from "next/link";
import { business } from "@/lib/menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-olive text-lg font-bold text-white">
            K
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-charcoal">
            {business.name}
          </span>
        </Link>
        <Link href="/platters" className="btn-secondary !px-4 !py-2 text-sm">
          Platters
        </Link>
      </div>
    </header>
  );
}
