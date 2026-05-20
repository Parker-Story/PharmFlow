const MAX_CHUNK_SIZE = 3000; // characters per chunk
const CHUNK_OVERLAP = 200;

export interface ExtractedContent {
  text: string;
  pageCount: number;
  filename: string;
}

export interface TextChunk {
  text: string;
  index: number;
  charStart: number;
  charEnd: number;
}

export async function extractTextFromPdf(
  buffer: Buffer,
  filename: string
): Promise<ExtractedContent> {
  // Dynamic import keeps pdf-parse out of the client bundle
  const pdfParse = (await import("pdf-parse")).default;

  const data = await pdfParse(buffer, {
    // Limit to reasonable page count to prevent memory issues
    max: 100,
  });

  return {
    text: data.text,
    pageCount: data.numpages,
    filename,
  };
}

export function chunkText(text: string): TextChunk[] {
  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  // Normalize whitespace
  const normalized = text.replace(/\s+/g, " ").trim();

  while (start < normalized.length) {
    const end = Math.min(start + MAX_CHUNK_SIZE, normalized.length);

    // Try to break at a sentence boundary
    let breakPoint = end;
    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const lastPeriod = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("! ")
      );
      if (lastPeriod > MAX_CHUNK_SIZE * 0.5) {
        breakPoint = start + lastPeriod + 1;
      }
    }

    chunks.push({
      text: normalized.slice(start, breakPoint).trim(),
      index,
      charStart: start,
      charEnd: breakPoint,
    });

    start = Math.max(breakPoint - CHUNK_OVERLAP, breakPoint);
    index++;
  }

  return chunks;
}
