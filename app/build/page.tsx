import Link from "next/link";
import { configItemsByCategory, configThemes, configMeta } from "@/lib/menu";
import { Configurator } from "@/components/Configurator";

export const metadata = {
  title: "Build a Large Oval Board — Kelly's Deli",
};

export default function BuildPage() {
  const groups = configItemsByCategory();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm font-semibold text-olive-dark underline">
        ← Home
      </Link>
      <Configurator groups={groups} themes={configThemes} meta={configMeta} />
    </div>
  );
}
