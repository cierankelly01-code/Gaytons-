import Link from "next/link";
import { business, aboutCopy } from "@/lib/menu";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-crust to-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="mb-3 inline-block rounded-full bg-olive/10 px-3 py-1 text-sm font-semibold text-olive-dark">
            {business.location} · Family-run deli
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {business.tagline}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/75">{aboutCopy.intro}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/platters" className="btn-primary">
              See our platters
            </Link>
            <a href={`tel:${business.phone}`} className="btn-ghost">
              Call the shop
            </a>
          </div>
        </div>
      </section>

      {/* Local produce */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">Fresh, local produce</h2>
            <p className="mt-3 text-charcoal/75">{aboutCopy.produce}</p>
          </div>
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">A family business</h2>
            <p className="mt-3 text-charcoal/75">{aboutCopy.family}</p>
            <Link href="/about" className="mt-4 inline-block font-semibold text-olive-dark underline">
              More about us →
            </Link>
          </div>
        </div>
      </section>

      {/* Platters teaser */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="card overflow-hidden bg-olive p-8 text-white">
          <h2 className="font-display text-2xl font-bold">Grazing boards &amp; platters</h2>
          <p className="mt-2 max-w-2xl text-white/85">
            Boards for parties, gatherings and get-togethers — from small boards for a few to
            large ovals for a full room. Build your own in store with us.
          </p>
          <Link href="/platters" className="btn mt-5 bg-white text-olive-dark hover:bg-cream">
            View the platters
          </Link>
        </div>
      </section>

      {/* Hours + find us */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-display text-xl font-bold">Opening hours</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {business.openingHours.map((row) => (
                <li key={row.day} className="flex justify-between border-b border-charcoal/5 py-1">
                  <span className="font-semibold">{row.day}</span>
                  <span className="text-charcoal/70">{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-xl font-bold">Find us</h3>
            <p className="mt-2 text-charcoal/75">
              {business.addressLine}
              <br />
              {business.location}
              <br />
              {business.postcode}
            </p>
            <p className="mt-3">
              <a className="font-semibold text-olive-dark underline" href={`tel:${business.phone}`}>
                {business.phone}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
