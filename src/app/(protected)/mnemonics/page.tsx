import { MnemonicGenerator } from "@/components/mnemonics/mnemonic-generator";
import { PointsHint } from "@/components/ui/points-hint";

export const metadata = { title: "Mnemonic Generator | PharmFlow" };

export default function MnemonicsPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Mnemonic Generator</h1>
        <p className="text-muted-foreground">Get a quirky AI-generated mnemonic to help drug groups stick.</p>
        <PointsHint ids={["mnemonic_5", "mnemonic_20"]} />
      </div>
      <MnemonicGenerator />
    </div>
  );
}
