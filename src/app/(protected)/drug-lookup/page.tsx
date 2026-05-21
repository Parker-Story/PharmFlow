import { DrugSearchBar } from "@/components/drug-lookup/drug-search-bar";

export const metadata = { title: "Drug Lookup — PharmFlow" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function DrugLookupPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drug Lookup</h1>
        <p className="text-muted-foreground">
          Search for FDA-approved prescribing information on any drug.
        </p>
      </div>

      <DrugSearchBar initialQuery={q} />

      <p className="text-xs text-muted-foreground text-center">
        Drug information sourced from{" "}
        <span className="font-medium">RxNorm</span> and{" "}
        <span className="font-medium">OpenFDA</span>. For educational use only.
      </p>
    </div>
  );
}
