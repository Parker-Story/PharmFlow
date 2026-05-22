"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchDrugs } from "@/lib/actions/drugs";
import type { DrugSearchResult } from "@/types/drugs";

interface DrugSearchBarProps {
  initialQuery?: string;
}

export function DrugSearchBar({ initialQuery = "" }: DrugSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<DrugSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      const drugs = await searchDrugs(query);
      setResults(drugs);
      setIsOpen(true);
      setIsLoading(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function handleSelect(drug: DrugSearchResult) {
    setQuery(drug.name);
    setIsOpen(false);
    router.push(`/drug-lookup/${drug.rxcui}`);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Search by drug name (e.g. lisinopril, amoxicillin)..."
          className="w-full rounded-xl border bg-background px-4 py-3 pl-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {isLoading && (
        <div className="absolute mt-1 w-full rounded-xl border bg-card shadow-md z-10 px-4 py-3">
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {isOpen && !isLoading && results.length > 0 && (
        <ul className="absolute mt-1 w-full rounded-xl border bg-card shadow-md z-10 max-h-64 overflow-y-auto">
          {results.map((drug) => (
            <li key={drug.rxcui}>
              <button
                onMouseDown={() => handleSelect(drug)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted"
              >
                <span className="font-medium">{drug.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && results.length === 0 && query.trim() && (
        <div className="absolute mt-1 w-full rounded-xl border bg-card shadow-md z-10 px-4 py-3">
          <p className="text-sm text-muted-foreground">No drugs found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
