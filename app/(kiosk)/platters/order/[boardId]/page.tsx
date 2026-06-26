import Link from "next/link";
import { notFound } from "next/navigation";
import { fixedBoards, getFixedBoard, business } from "@/lib/menu";
import { formatGBP } from "@/lib/format";
import { BoardImage } from "@/components/BoardImage";
import { OrderForm } from "@/components/OrderForm";

// Pre-render the three known boards.
export function generateStaticParams() {
  return fixedBoards.map((b) => ({ boardId: b.id }));
}

export default function FixedOrderPage({ params }: { params: { boardId: string } }) {
  const board = getFixedBoard(params.boardId);
  if (!board) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/platters" className="text-sm font-semibold text-olive-dark underline">
        ← All boards
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {/* Board detail */}
        <div>
          <BoardImage
            src={board.image}
            alt={`${board.name} grazing platter`}
            label={board.name}
            className="h-56 w-full rounded-2xl sm:h-72"
          />
          <h1 className="mt-5 font-display text-3xl font-bold">{board.name}</h1>
          <p className="mt-1 font-semibold text-olive-dark">Serves {board.serves}</p>
          <p className="mt-1 text-2xl font-bold text-terracotta-dark">
            {board.price > 0 ? formatGBP(board.price) : "£—"}
          </p>
          <p className="mt-3 text-charcoal/75">{board.blurb}</p>

          <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-charcoal/60">
            What&apos;s included
          </h2>
          <ul className="mt-2 space-y-1 text-charcoal/80">
            {board.includes.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-olive">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-xl bg-crust px-4 py-3 text-sm font-medium text-charcoal/80">
            {business.collectionNote} {business.depositNote}
          </p>
        </div>

        {/* Order form */}
        <div className="card h-fit p-6">
          <h2 className="font-display text-xl font-bold">Reserve this board</h2>
          <p className="mt-1 text-sm text-charcoal/65">
            We&apos;ll confirm the details — deposit paid in store.
          </p>
          <div className="mt-5">
            <OrderForm
              order={{ type: "fixed", boardId: board.id }}
              total={board.price}
              disabled={board.price <= 0}
            />
            {board.price <= 0 && (
              <p className="mt-3 text-center text-xs text-terracotta-dark">
                Pricing coming soon — please call us to order this board.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
