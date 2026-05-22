# PharmFlow

**Study tools built for pharmacy students.**

🔗 [PharmFlow](https://pharmflow-ldd.vercel.app/)

---

## What it is

PharmFlow is a web app I built for my wife, who is studying to become a pharmacist. Pharmacy school involves memorizing enormous amounts of drug names, mechanisms, interactions, and clinical guidelines, and the existing study tools weren't built with that in mind.

PharmFlow lets students upload their lecture notes (PDF) and instantly generate study materials tailored to pharmacy content, plus look up real FDA prescribing information without leaving the app.

---

## Features

**Generate from lecture notes**
- **Practice Exam**: multiple choice and true/false questions at adjustable difficulty
- **Notecards**: flashcard sets with a Know It / Don't Know study flow
- **Summary**: a 5-sentence overview of the key concepts from your notes

All three can be generated from a single upload at once. PDFs are never stored; only the extracted text is used for generation.

**Drug Lookup**
Search any drug by generic or brand name and get the full FDA-approved prescribing monograph: indications, dosage, mechanism of action, contraindications, warnings, adverse reactions, interactions, and more. No AI involved; data comes directly from RxNorm and OpenFDA.

**Library**
All generated content saves to a personal library with folder organization. Notecard sets can be studied, edited, and replayed. Practice exams track your score history.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth + Database | Supabase (SSR, Row-Level Security) |
| AI | Groq (Llama 3.3 70B Versatile) |
| Drug Data | RxNorm API + OpenFDA API |
| Deployment | Vercel |

---

## Why I built it

Pharmacy school is hard. The volume of drug-specific content students are expected to retain is unlike most other fields, and generic study apps don't account for that. I wanted to build something that actually fits into how pharmacy students study: not just a quiz generator, but a full study workflow that goes from lecture notes to exam-ready in a few minutes.

This is a personal project. It's not commercial software, but it's built to be genuinely useful.
