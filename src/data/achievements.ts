export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_exam",        title: "First Exam",        description: "Generate your first practice exam",       icon: "📝" },
  { id: "five_exams",        title: "On a Roll",         description: "Generate 5 practice exams",               icon: "🔥" },
  { id: "ten_exams",         title: "Exam Machine",      description: "Generate 10 practice exams",              icon: "🏆" },
  { id: "perfect_score",     title: "Flawless",          description: "Score 100% on a practice exam",           icon: "⭐" },
  { id: "first_notecard",    title: "Card Shark",        description: "Generate your first notecard set",        icon: "🃏" },
  { id: "five_notecards",    title: "Stacked",           description: "Generate 5 notecard sets",                icon: "📚" },
  { id: "first_summary",     title: "TL;DR",             description: "Generate your first summary",             icon: "✂️" },
  { id: "all_three",         title: "Full Arsenal",      description: "Use all three study tools at least once", icon: "🎯" },
  { id: "first_folder",      title: "Getting Organized", description: "Create your first folder",                icon: "📁" },
  { id: "take_a_break",      title: "Take a Break",      description: "Visit the Need a Break? page",            icon: "🐾" },
  { id: "first_drug_lookup", title: "Pharmacist",        description: "Look up a drug in the FDA database",      icon: "💊" },
];
