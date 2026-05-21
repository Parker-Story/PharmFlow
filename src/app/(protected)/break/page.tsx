import { Heart } from "lucide-react";
import { DogSlideshow } from "@/components/break/dog-slideshow";

export const metadata = { title: "Take a Break — PharmFlow" };

export default function BreakPage() {
  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="mb-8 text-center">
        <Heart className="mx-auto mb-2 h-6 w-6 text-rose-400" />
        <h1 className="text-2xl font-bold">Need a Break?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re doing great. These cuties think so too!
        </p>
      </div>
      <DogSlideshow />
    </div>
  );
}
