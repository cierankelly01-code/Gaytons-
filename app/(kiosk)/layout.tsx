import Link from "next/link";
import { business, configMeta } from "@/lib/menu";

// In-store iPad tool shell: minimal, full-height, no marketing chrome. Pin
// /platters full-screen on the iPad and it behaves like a kiosk app.
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-olive text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/platters" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-bold">
              K
            </span>
            <span className="font-display text-lg font-bold">{business.name} · Platters</span>
          </Link>
          <span className="hidden text-sm text-white/80 sm:block">{configMeta.serves} & more</span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
