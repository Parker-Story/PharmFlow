import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrugSearchBar } from "@/components/drug-lookup/drug-search-bar";
import { DrugDetailSection } from "@/components/drug-lookup/drug-detail-section";
import { getDrugDetail } from "@/lib/actions/drugs";

interface PageProps {
  params: Promise<{ rxcui: string }>;
}

export default async function DrugDetailPage({ params }: PageProps) {
  const { rxcui } = await params;
  const drug = await getDrugDetail(rxcui);

  const sections = [
    { title: "Indications and Usage", content: drug.label?.indicationsAndUsage, defaultOpen: true },
    { title: "Dosage and Administration", content: drug.label?.dosageAndAdministration, defaultOpen: true },
    { title: "Mechanism of Action", content: drug.label?.mechanismOfAction },
    { title: "Contraindications", content: drug.label?.contraindicationsText },
    { title: "Warnings and Precautions", content: drug.label?.warningsAndPrecautions },
    { title: "Adverse Reactions", content: drug.label?.adverseReactions },
    { title: "Drug Interactions", content: drug.label?.drugInteractions },
    { title: "Use in Specific Populations", content: drug.label?.useInSpecificPopulations },
    { title: "Pharmacokinetics", content: drug.label?.pharmacokinetics },
    { title: "Description", content: drug.label?.description },
  ].filter((s): s is typeof s & { content: string } => !!s.content);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/drug-lookup">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Drug Lookup
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{drug.name}</h1>
        {drug.label?.genericName && drug.label.genericName.toLowerCase() !== drug.name.toLowerCase() && (
          <p className="text-sm text-muted-foreground">Generic: {drug.label.genericName}</p>
        )}
        {drug.label?.brandName && (
          <p className="text-sm text-muted-foreground">Brand: {drug.label.brandName}</p>
        )}
      </div>

      <DrugSearchBar />

      {drug.label === null ? (
        <div className="rounded-xl border bg-card px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No FDA prescribing information found for this drug.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((s) => (
            <DrugDetailSection
              key={s.title}
              title={s.title}
              content={s.content}
              defaultOpen={s.defaultOpen}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pb-4">
        Drug information sourced from{" "}
        <span className="font-medium">RxNorm</span> and{" "}
        <span className="font-medium">OpenFDA</span>. For educational use only.
      </p>
    </div>
  );
}
