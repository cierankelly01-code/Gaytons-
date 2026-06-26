import Link from "next/link";
import { business, aboutCopy } from "@/lib/menu";

export const metadata = { title: `About — ${business.name}` };

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm font-semibold text-olive-dark underline">
        ← Home
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">About {business.name}</h1>
      <div className="mt-5 space-y-4 text-charcoal/80">
        <p>{aboutCopy.intro}</p>
        <p>{aboutCopy.produce}</p>
        <p>{aboutCopy.family}</p>
      </div>
      <p className="mt-8 rounded-xl bg-crust px-4 py-3 text-sm text-charcoal/70">
        More to come — we&apos;ll keep adding to this page as we go.
      </p>
    </section>
  );
}
