export interface NotecardItem {
  id: string;
  front: string;
  back: string;
  orderIndex: number;
}

export interface NotecardSetWithCards {
  id: string;
  title: string;
  sourceFilename: string;
  cardCount: number;
  status: "processing" | "ready" | "failed";
  createdAt: string;
  cards: NotecardItem[];
}

export interface NotecardProcessingResult {
  success: boolean;
  setId?: string;
  error?: string;
}
