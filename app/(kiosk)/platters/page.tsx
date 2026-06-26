import Link from "next/link";
import { fixedBoards, configMeta, configThemes, business } from "@/lib/menu";
import { BoardCard } from "@/components/BoardCard";

export const metadata = { title: `Platters — ${business.name}` };

export default function PlattersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold">Our platters</h1>
      <p className="mt-1 text-charcoal/70">
        Pick a board to buy now, or build a large oval board together.
      </p>
      <p className="mt-2 text-sm font-medium text-terracotta-dark">{business.depositNote}</p>

      {/* Buy-now boards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {fixedBoards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>

      {/* Build a large oval board */}
      <section className="mt-10">
        <div className="card overflow-hidden bg-charcoal p-6 text-cream sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Build a Large Oval Board</h2>
              <p className="mt-1 text-cream/80">
                Serves {configMeta.serves}. Savoury, salmon, cheese or sandwich — or a mix. Build it
                together and see the price as you go.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {configThemes.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full bg-cream/10 px-3 py-1 text-sm font-medium text-cream/90"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
            <Link href="/platters/build" className="btn bg-terracotta text-white hover:bg-terracotta-dark">
              Start building
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
