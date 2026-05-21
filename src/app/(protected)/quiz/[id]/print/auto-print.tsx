"use client";

import { useEffect } from "react";

export function PrintControls() {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <div className="print:hidden flex justify-end p-4 border-b">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Save as PDF
      </button>
    </div>
  );
}
