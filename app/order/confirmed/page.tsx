import Link from "next/link";
import { business } from "@/lib/menu";

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-olive text-3xl text-white">
        ✓
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold">Order received — thank you!</h1>
      <p className="mt-3 text-charcoal/75">
        We&apos;ve got your order and will give you a call to confirm the details and collection
        time.
      </p>

      {ref && (
        <p className="mx-auto mt-6 inline-block rounded-xl bg-crust px-5 py-3 text-sm">
          Your reference: <span className="font-mono font-bold">{ref}</span>
        </p>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-charcoal/5">
        <h2 className="font-display text-lg font-bold">What happens next</h2>
        <ul className="mt-3 space-y-2 text-sm text-charcoal/75">
          <li>1. We prepare your board fresh on the day.</li>
          <li>2. {business.collectionNote}</li>
          <li>
            3. Collect from {business.name}, {business.location} — and pay when you collect.
          </li>
        </ul>
        <p className="mt-4 text-sm">
          Questions?{" "}
          <a className="font-semibold text-olive-dark underline" href={`tel:${business.phone}`}>
            {business.phone}
          </a>
        </p>
      </div>

      <Link href="/" className="btn-secondary mt-8">
        Back to home
      </Link>
    </div>
  );
}
