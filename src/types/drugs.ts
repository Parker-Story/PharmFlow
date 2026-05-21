export interface DrugSearchResult {
  rxcui: string;
  name: string;
  tty: string;
}

export interface DrugLabel {
  genericName?: string;
  brandName?: string;
  indicationsAndUsage?: string;
  dosageAndAdministration?: string;
  contraindicationsText?: string;
  warningsAndPrecautions?: string;
  adverseReactions?: string;
  drugInteractions?: string;
  useInSpecificPopulations?: string;
  mechanismOfAction?: string;
  pharmacokinetics?: string;
  description?: string;
}

export interface DrugDetail {
  rxcui: string;
  name: string;
  label: DrugLabel | null;
}
