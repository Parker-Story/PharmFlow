"use server";

import type { DrugSearchResult, DrugDetail, DrugLabel } from "@/types/drugs";

export async function searchDrugs(query: string): Promise<DrugSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(q)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      drugGroup?: {
        conceptGroup?: Array<{
          tty?: string;
          conceptProperties?: Array<{ rxcui: string; name: string; tty: string }>;
        }>;
      };
    };

    const results: DrugSearchResult[] = [];
    for (const group of data?.drugGroup?.conceptGroup ?? []) {
      const tty = group.tty ?? "";
      if (!["IN", "BN", "MIN"].includes(tty)) continue;
      for (const concept of group.conceptProperties ?? []) {
        results.push({ rxcui: concept.rxcui, name: concept.name, tty });
      }
    }

    return results.slice(0, 10);
  } catch {
    return [];
  }
}

export async function getDrugDetail(rxcui: string): Promise<DrugDetail> {
  const [name, label] = await Promise.all([
    fetchRxNormName(rxcui),
    fetchOpenFDALabel(rxcui),
  ]);

  return { rxcui, name, label };
}

async function fetchRxNormName(rxcui: string): Promise<string> {
  try {
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return rxcui;
    const data = (await res.json()) as { properties?: { name?: string } };
    return data?.properties?.name ?? rxcui;
  } catch {
    return rxcui;
  }
}

async function fetchOpenFDALabel(rxcui: string): Promise<DrugLabel | null> {
  try {
    const res = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.rxcui:${rxcui}&limit=5`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;

    type LabelResult = {
      openfda?: { generic_name?: string[]; brand_name?: string[] };
      indications_and_usage?: string[];
      dosage_and_administration?: string[];
      contraindications?: string[];
      warnings_and_precautions?: string[];
      adverse_reactions?: string[];
      drug_interactions?: string[];
      use_in_specific_populations?: string[];
      mechanism_of_action?: string[];
      pharmacokinetics?: string[];
      description?: string[];
    };

    const data = (await res.json()) as { results?: LabelResult[] };
    const results = data?.results ?? [];

    // Prefer non-combo products (generic_name without "/")
    let result = results[0];
    for (const r of results) {
      const names = r?.openfda?.generic_name ?? [];
      if (names.every((n) => !n.includes("/"))) {
        result = r;
        break;
      }
    }

    if (!result) return null;

    const first = (arr?: string[]) => arr?.[0];

    return {
      genericName: first(result.openfda?.generic_name),
      brandName: first(result.openfda?.brand_name),
      indicationsAndUsage: first(result.indications_and_usage),
      dosageAndAdministration: first(result.dosage_and_administration),
      contraindicationsText: first(result.contraindications),
      warningsAndPrecautions: first(result.warnings_and_precautions),
      adverseReactions: first(result.adverse_reactions),
      drugInteractions: first(result.drug_interactions),
      useInSpecificPopulations: first(result.use_in_specific_populations),
      mechanismOfAction: first(result.mechanism_of_action),
      pharmacokinetics: first(result.pharmacokinetics),
      description: first(result.description),
    };
  } catch {
    return null;
  }
}
