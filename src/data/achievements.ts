export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  chain: string | null;
  chainLabel: string | null;
  threshold: number | null;
  metric: string | null;
}

export interface Tier {
  name: string;
  icon: string;
  minPoints: number;
}

export const TIERS: Tier[] = [
  { name: "Still Counting Pills",  icon: "💊", minPoints: 0 },
  { name: "Aspiring Label Reader", icon: "🔍", minPoints: 50 },
  { name: "PRN Scholar",           icon: "📖", minPoints: 150 },
  { name: "PharmD Padawan",        icon: "⚗️",  minPoints: 350 },
  { name: "Rx Ranger",             icon: "🤠", minPoints: 600 },
  { name: "Board Slayer",          icon: "⚔️",  minPoints: 900 },
  { name: "Clinical Pharmacist",   icon: "🏥", minPoints: 1200 },
  { name: "The Pharmacist",        icon: "👑", minPoints: 1800 },
];

export function getTier(points: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPoints) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(points: number): Tier | null {
  for (const tier of TIERS) {
    if (points < tier.minPoints) return tier;
  }
  return null;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Practice Exam Generation
  { id: "exam_gen_1",  title: "First Prescription",      description: "Generate your first practice exam",    icon: "📝", points: 10,  chain: "exam_gen",    chainLabel: "Practice Exams",     threshold: 1,  metric: "quizCount" },
  { id: "exam_gen_5",  title: "Studying Protocol",       description: "Generate 5 practice exams",           icon: "📝", points: 30,  chain: "exam_gen",    chainLabel: "Practice Exams",     threshold: 5,  metric: "quizCount" },
  { id: "exam_gen_10", title: "Exam Machine",            description: "Generate 10 practice exams",          icon: "📝", points: 60,  chain: "exam_gen",    chainLabel: "Practice Exams",     threshold: 10, metric: "quizCount" },
  { id: "exam_gen_25", title: "Board Prep Mode",         description: "Generate 25 practice exams",          icon: "📝", points: 120, chain: "exam_gen",    chainLabel: "Practice Exams",     threshold: 25, metric: "quizCount" },

  // Exam Completions
  { id: "exam_done_1",  title: "First Test",             description: "Complete your first practice exam",   icon: "✅", points: 15,  chain: "exam_done",   chainLabel: "Exam Completions",   threshold: 1,  metric: "attemptCount" },
  { id: "exam_done_5",  title: "Test Veteran",           description: "Complete 5 practice exams",           icon: "✅", points: 40,  chain: "exam_done",   chainLabel: "Exam Completions",   threshold: 5,  metric: "attemptCount" },
  { id: "exam_done_10", title: "Serial Test-Taker",      description: "Complete 10 practice exams",          icon: "✅", points: 80,  chain: "exam_done",   chainLabel: "Exam Completions",   threshold: 10, metric: "attemptCount" },
  { id: "exam_done_25", title: "Boards Ready",           description: "Complete 25 practice exams",          icon: "✅", points: 150, chain: "exam_done",   chainLabel: "Exam Completions",   threshold: 25, metric: "attemptCount" },

  // Perfect Scores
  { id: "perfect_1", title: "Flawless",                  description: "Score 100% on a practice exam",       icon: "⭐", points: 50,  chain: "perfect",     chainLabel: "Perfect Scores",     threshold: 1,  metric: "perfectCount" },
  { id: "perfect_3", title: "Consistently Perfect",      description: "Score 100% on 3 practice exams",     icon: "⭐", points: 100, chain: "perfect",     chainLabel: "Perfect Scores",     threshold: 3,  metric: "perfectCount" },
  { id: "perfect_5", title: "Untouchable",               description: "Score 100% on 5 practice exams",     icon: "⭐", points: 200, chain: "perfect",     chainLabel: "Perfect Scores",     threshold: 5,  metric: "perfectCount" },

  // Notecard Generation
  { id: "notecard_1",  title: "Card Shark",              description: "Generate your first notecard set",    icon: "🃏", points: 10,  chain: "notecard",    chainLabel: "Notecard Sets",      threshold: 1,  metric: "notecardCount" },
  { id: "notecard_5",  title: "Stacked",                 description: "Generate 5 notecard sets",            icon: "🃏", points: 30,  chain: "notecard",    chainLabel: "Notecard Sets",      threshold: 5,  metric: "notecardCount" },
  { id: "notecard_10", title: "Flashcard Factory",       description: "Generate 10 notecard sets",           icon: "🃏", points: 60,  chain: "notecard",    chainLabel: "Notecard Sets",      threshold: 10, metric: "notecardCount" },

  // Summaries
  { id: "summary_1",  title: "TL;DR",                   description: "Generate your first summary",         icon: "✂️", points: 5,   chain: "summary",     chainLabel: "Summaries",          threshold: 1,  metric: "summaryCount" },
  { id: "summary_5",  title: "The Summarizer",           description: "Generate 5 summaries",                icon: "✂️", points: 15,  chain: "summary",     chainLabel: "Summaries",          threshold: 5,  metric: "summaryCount" },
  { id: "summary_10", title: "Cliff Notes",              description: "Generate 10 summaries",               icon: "✂️", points: 30,  chain: "summary",     chainLabel: "Summaries",          threshold: 10, metric: "summaryCount" },

  // Rx Verification
  { id: "rx_correct_1",  title: "First Catch",           description: "Get your first Rx verification right",icon: "💉", points: 20,  chain: "rx_correct",  chainLabel: "Rx Verification",    threshold: 1,  metric: "rxCorrectCount" },
  { id: "rx_correct_5",  title: "Eagle Eye",             description: "Get 5 Rx verifications right",        icon: "💉", points: 50,  chain: "rx_correct",  chainLabel: "Rx Verification",    threshold: 5,  metric: "rxCorrectCount" },
  { id: "rx_correct_10", title: "Clinical Eye",          description: "Get 10 Rx verifications right",       icon: "💉", points: 100, chain: "rx_correct",  chainLabel: "Rx Verification",    threshold: 10, metric: "rxCorrectCount" },
  { id: "rx_correct_25", title: "Pharmacist's Instinct", description: "Get 25 Rx verifications right",       icon: "💉", points: 200, chain: "rx_correct",  chainLabel: "Rx Verification",    threshold: 25, metric: "rxCorrectCount" },

  // Drug Lookups
  { id: "drug_lookup_1",  title: "Pharmacist",           description: "Look up your first drug",             icon: "🔬", points: 10,  chain: "drug_lookup", chainLabel: "Drug Lookups",       threshold: 1,  metric: "drugLookupCount" },
  { id: "drug_lookup_10", title: "Drug Detective",       description: "Look up 10 drugs",                    icon: "🔬", points: 30,  chain: "drug_lookup", chainLabel: "Drug Lookups",       threshold: 10, metric: "drugLookupCount" },
  { id: "drug_lookup_25", title: "FDA Whisperer",        description: "Look up 25 drugs",                    icon: "🔬", points: 60,  chain: "drug_lookup", chainLabel: "Drug Lookups",       threshold: 25, metric: "drugLookupCount" },

  // Mnemonics
  { id: "mnemonic_5",  title: "Memory Palace",           description: "Generate 5 mnemonics",                icon: "🧠", points: 20,  chain: "mnemonic",    chainLabel: "Mnemonics",          threshold: 5,  metric: "mnemonicCount" },
  { id: "mnemonic_20", title: "Mnemonic Master",         description: "Generate 20 mnemonics",               icon: "🧠", points: 50,  chain: "mnemonic",    chainLabel: "Mnemonics",          threshold: 20, metric: "mnemonicCount" },

  // One-offs
  { id: "all_three",    title: "Full Arsenal",           description: "Use all three study tools at least once", icon: "🎯", points: 25, chain: null, chainLabel: null, threshold: null, metric: null },
  { id: "first_folder", title: "Getting Organized",      description: "Create your first folder",            icon: "📁", points: 10,  chain: null, chainLabel: null, threshold: null, metric: null },
  { id: "take_a_break", title: "Self Care",              description: "Visit the Need a Break? page",        icon: "🐾", points: 5,   chain: null, chainLabel: null, threshold: null, metric: null },
];
