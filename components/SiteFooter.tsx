import { business } from "@/lib/menu";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-charcoal/10 bg-crust">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-xl font-bold">{business.name}</h3>
          <p className="mt-2 max-w-xs text-sm text-charcoal/70">
            Family-run deli in {business.location}. {business.addressLine},{" "}
            {business.postcode}.
          </p>
          <p className="mt-3 text-sm">
            <a className="font-semibold text-olive-dark underline" href={`tel:${business.phone}`}>
              {business.phone}
            </a>
            <span className="mx-2 text-charcoal/30">·</span>
            <a className="font-semibold text-olive-dark underline" href={`mailto:${business.email}`}>
              {business.email}
            </a>
          </p>
          <p className="mt-3 text-sm font-medium text-terracotta-dark">
            {business.collectionNote} Pay when you collect.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-charcoal/60">
            Opening hours
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            {business.openingHours.map((row) => (
              <li key={row.day} className="flex justify-between border-b border-charcoal/5 py-1">
                <span className="font-semibold">{row.day}</span>
                <span className="text-charcoal/70">{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-charcoal/10 py-4 text-center text-xs text-charcoal/50">
        © {business.name}, {business.location}. Collection only · Pay on collection.
      </div>
    </footer>
  );
}
