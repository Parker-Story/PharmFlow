import { RxVerifier } from "@/components/verify/rx-verifier";
import { PointsHint } from "@/components/ui/points-hint";

export const metadata = { title: "Rx Verification | PharmFlow" };

export default function VerifyPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Rx Verification</h1>
        <p className="text-muted-foreground">Act as the pharmacist and spot errors in AI-generated prescriptions.</p>
        <PointsHint ids={["rx_correct_1", "rx_correct_5", "rx_correct_10", "rx_correct_25"]} />
      </div>
      <RxVerifier />
    </div>
  );
}
