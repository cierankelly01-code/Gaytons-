import Link from "next/link";
import { business, fixedBoards, configMeta } from "@/lib/menu";
import { BoardCard } from "@/components/BoardCard";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-crust to-cream">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <p className="mb-3 inline-block rounded-full bg-olive/10 px-3 py-1 text-sm font-semibold text-olive-dark">
            {business.location} · Collection only
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Grazing boards &amp; platters, made by family in {business.location}.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/75">
            Fresh, generous boards for parties, gatherings and get-togethers. Order ahead,
            collect in store.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="#boards" className="btn-primary">
              See the boards
            </Link>
            <Link href="/build" className="btn-ghost">
              Build a custom board
            </Link>
          </div>
          <p className="mt-5 text-sm font-medium text-terracotta-dark">
            All boards are made to order — please give us 48 hours&apos; notice. Pay when you
            collect.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Who we are</h2>
          <p className="mt-3 max-w-3xl text-charcoal/75">
            {business.name} is a family-run deli in {business.location}.{" "}
            <span className="italic text-charcoal/60">
              FILL: a sentence or two about the family / how long you&apos;ve been going / what
              you care about.
            </span>{" "}
            Every board is put together fresh by us.
          </p>
        </div>
      </section>

      {/* Boards */}
      <section id="boards" className="mx-auto max-w-5xl px-4 py-8 scroll-mt-20">
        <h2 className="font-display text-3xl font-bold">Our boards</h2>
        <p className="mt-2 max-w-2xl text-charcoal/70">
          Pick a board, or build your own. Small for a few, large ovals for a full room.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fixedBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </section>

      {/* Custom CTA */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="card overflow-hidden bg-olive p-8 text-white">
          <h2 className="font-display text-2xl font-bold">Want something specific?</h2>
          <p className="mt-2 max-w-2xl text-white/85">
            Build your own large oval board — savoury, Indian, smoked salmon, or a mix. Serves{" "}
            {configMeta.serves}.
          </p>
          <Link href="/build" className="btn mt-5 bg-white text-olive-dark hover:bg-cream">
            Build your board
          </Link>
        </div>
      </section>

      {/* Contact / location */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-5 sm:grid-cols-2">
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
          <div className="card p-6">
            <h3 className="font-display text-xl font-bold">Opening hours</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {business.openingHours.map((row) => (
                <li
                  key={row.day}
                  className="flex justify-between border-b border-charcoal/5 py-1"
                >
                  <span className="font-semibold">{row.day}</span>
                  <span className="text-charcoal/70">{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
