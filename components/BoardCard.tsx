import Link from "next/link";
import type { FixedBoard } from "@/lib/menu";
import { formatGBP } from "@/lib/format";
import { BoardImage } from "./BoardImage";

export function BoardCard({ board }: { board: FixedBoard }) {
  return (
    <div className="card flex flex-col overflow-hidden">
      <BoardImage
        src={board.image}
        alt={`${board.name} grazing platter`}
        label={board.name}
        className="h-44 w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-bold">{board.name}</h3>
          <span className="text-xl font-bold text-terracotta-dark">
            {board.price > 0 ? formatGBP(board.price) : "£—"}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-olive-dark">Serves {board.serves}</p>
        <p className="mt-2 text-sm text-charcoal/70">{board.blurb}</p>
        <ul className="mt-3 space-y-1 text-sm text-charcoal/70">
          {board.includes.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-olive">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Link href={`/order/${board.id}`} className="btn-primary mt-5 w-full">
          Order this board
        </Link>
      </div>
    </div>
  );
}
