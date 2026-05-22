"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Drop your images into public/dogs/ and list the filenames here
const IMAGES = [
  "/dogs/dog-01.jpg",
  "/dogs/dog-02.jpg",
  "/dogs/dog-03.jpg",
  "/dogs/dog-04.jpg",
  "/dogs/dog-05.jpg",
  "/dogs/dog-06.jpg",
  "/dogs/dog-07.jpg",
  "/dogs/dog-08.jpg",
  "/dogs/dog-09.jpg",
  "/dogs/dog-10.jpg",
  "/dogs/dog-11.jpg",
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "idle" | "out" | "in";

export function DogSlideshow() {
  const [images, setImages] = useState(IMAGES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setImages(shuffleArray(IMAGES));
    setIndex(0);
  }, []);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  function go(dir: 1 | -1) {
    if (phase !== "idle") return;
    const next = (index + dir + images.length) % images.length;
    setPendingIndex(next);
    setPhase("out");
  }

  function handleAnimationEnd() {
    if (phase === "out") {
      if (pendingIndex !== null) setIndex(pendingIndex);
      setPhase("in");
    } else if (phase === "in") {
      setPhase("idle");
    }
  }

  const animClass = phase === "out" ? "flip-out" : phase === "in" ? "flip-in" : "";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Photo */}
      <div className="relative w-full h-[68vh] rounded-2xl overflow-hidden shadow-xl border">
        <div className={`relative w-full h-full ${animClass}`} onAnimationEnd={handleAnimationEnd}>
          <Image
            src={images[index]}
            alt="Good dog"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Counter */}
      <p className="text-sm text-muted-foreground">{index + 1} / {images.length}</p>

      {/* Arrows */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => go(-1)}
          disabled={phase !== "idle"}
          className="flex h-12 w-12 items-center justify-center rounded-full border bg-card shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={phase !== "idle"}
          className="flex h-12 w-12 items-center justify-center rounded-full border bg-card shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
