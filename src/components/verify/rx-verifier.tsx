"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateRxScenarioAction } from "@/lib/actions/verify";
import { logEvent } from "@/lib/actions/achievements";
import type { RxScenario } from "@/lib/ai/generate";

type GameState = "idle" | "loading" | "active" | "submitted";

export function RxVerifier() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [scenario, setScenario] = useState<RxScenario | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadScenario() {
    setGameState("loading");
    setSelected(null);
    setError(null);
    setScenario(null);

    const res = await generateRxScenarioAction();
    if ("error" in res) {
      setError(res.error);
      setGameState("idle");
      return;
    }
    setScenario(res);
    setGameState("active");
  }

  function handleSubmit() {
    if (!selected || !scenario) return;
    if (selected === scenario.correctAnswer) {
      logEvent("rx_correct");
    }
    setGameState("submitted");
  }

  const isCorrect = gameState === "submitted" && selected === scenario?.correctAnswer;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Rx Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review the patient profile and prescription. Identify any errors.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {gameState === "idle" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed">
          <Stethoscope className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Ready to check a prescription?</p>
          <Button onClick={loadScenario} size="lg">
            Generate Scenario
          </Button>
        </div>
      )}

      {gameState === "loading" && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Generating scenario...
        </div>
      )}

      {scenario && (gameState === "active" || gameState === "submitted") && (
        <div className="space-y-4">
          {/* Patient Profile */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient Profile</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span><span className="text-muted-foreground">Age:</span> {scenario.patientProfile.age}</span>
              <span><span className="text-muted-foreground">Weight:</span> {scenario.patientProfile.weight}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Conditions: </span>
              {scenario.patientProfile.conditions.join(", ")}
            </div>
            {scenario.patientProfile.allergies.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Allergies: </span>
                <span className="text-destructive font-medium">{scenario.patientProfile.allergies.join(", ")}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Current Meds: </span>
              {scenario.patientProfile.currentMeds.join("; ")}
            </div>
            {scenario.patientProfile.labs.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Labs: </span>
                {scenario.patientProfile.labs.map((l) => (
                  <span key={l.name} className="mr-4">
                    <span className="font-medium">{l.name}</span> {l.value}{" "}
                    <span className="text-muted-foreground text-xs">(ref: {l.normal})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Prescription */}
          <div className="rounded-2xl border bg-primary/5 border-primary/20 p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">New Prescription</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div><span className="text-muted-foreground">Drug: </span><span className="font-semibold">{scenario.prescription.drug}</span></div>
              <div><span className="text-muted-foreground">Dose: </span>{scenario.prescription.dose}</div>
              <div><span className="text-muted-foreground">Route: </span>{scenario.prescription.route}</div>
              <div><span className="text-muted-foreground">Frequency: </span>{scenario.prescription.frequency}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Indication: </span>{scenario.prescription.indication}</div>
            </div>
          </div>

          {/* Answer options */}
          <div className="space-y-2">
            <p className="text-sm font-medium">What is your assessment?</p>
            {scenario.options.map((opt) => {
              const isSelected = selected === opt;
              const showResult = gameState === "submitted";
              const isCorrectOpt = opt === scenario.correctAnswer;

              return (
                <button
                  key={opt}
                  onClick={() => { if (gameState === "active") setSelected(opt); }}
                  disabled={gameState === "submitted"}
                  className={cn(
                    "w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors",
                    gameState === "active" && !isSelected && "hover:bg-muted/60 border-border",
                    gameState === "active" && isSelected && "border-primary bg-primary/10",
                    showResult && isCorrectOpt && "border-green-500 bg-green-50 dark:bg-green-950/30",
                    showResult && isSelected && !isCorrectOpt && "border-destructive bg-destructive/10",
                    showResult && !isSelected && !isCorrectOpt && "border-border opacity-50"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Result */}
          {gameState === "submitted" && (
            <div className={cn(
              "rounded-2xl border p-5 space-y-2",
              isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-destructive bg-destructive/10"
            )}>
              <div className="flex items-center gap-2">
                {isCorrect
                  ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                <p className="font-semibold text-sm">{isCorrect ? "Correct!" : "Not quite."}</p>
              </div>
              <p className="text-sm text-muted-foreground">{scenario.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {gameState === "active" && (
              <Button onClick={handleSubmit} disabled={!selected} className="flex-1">
                Submit Answer
              </Button>
            )}
            {gameState === "submitted" && (
              <Button onClick={loadScenario} className="flex-1">
                Next Scenario
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
