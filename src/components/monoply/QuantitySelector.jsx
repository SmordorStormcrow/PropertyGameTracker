import React from 'react';
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ value, onChange, min = 1, max = 99, label = "Quantity" }) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="space-y-2">
      <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide">{label}</p>
      <div className="flex items-center justify-center gap-4 bg-zinc-800 rounded-xl p-3">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className="h-12 w-12 rounded-xl bg-zinc-700 border-zinc-600 hover:bg-zinc-600"
        >
          <Minus className="h-5 w-5 text-white" />
        </Button>
        <span className="text-3xl font-bold text-white w-16 text-center">{value}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className="h-12 w-12 rounded-xl bg-zinc-700 border-zinc-600 hover:bg-zinc-600"
        >
          <Plus className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );
}