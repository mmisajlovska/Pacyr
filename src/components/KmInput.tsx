"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface KmInputProps {
  onGenerate: (km: number) => void;
  isLoading: boolean;
}

export function KmInput({ onGenerate, isLoading }: KmInputProps) {
  const [km, setKm] = useState(5);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Target distance</span>
        <span className="text-2xl font-bold tabular-nums">{km} km</span>
      </div>

      <Slider
        min={1}
        max={42}
        step={0.5}
        value={[km]}
        onValueChange={([v]) => setKm(v)}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 km</span>
        <span>42 km</span>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => onGenerate(km)}
        disabled={isLoading}
      >
        {isLoading ? "Generating route…" : "Generate route"}
      </Button>
    </div>
  );
}
