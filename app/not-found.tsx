import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-olive text-3xl font-bold text-white">
        K
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-charcoal/70">
        That board seems to have been cleared away. Let&apos;s get you back to the good stuff.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </section>
  );
}
