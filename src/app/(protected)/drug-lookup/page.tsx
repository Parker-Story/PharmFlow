import { DrugSearchBar } from "@/components/drug-lookup/drug-search-bar";
import { PointsHint } from "@/components/ui/points-hint";

export const metadata = { title: "Drug Lookup | PharmFlow" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function DrugLookupPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Drug Lookup</h1>
        <p className="text-muted-foreground">
          Search for FDA-approved prescribing information on any drug.
        </p>
        <PointsHint ids={["drug_lookup_1", "drug_lookup_10", "drug_lookup_25"]} />
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
