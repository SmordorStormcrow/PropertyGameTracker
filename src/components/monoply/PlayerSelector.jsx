import React from 'react';
import { cn } from "@/lib/utils";
import { Building2, ParkingCircle } from "lucide-react";

const colorMap = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
};

export default function PlayerSelector({ 
  players, 
  selected, 
  onSelect, 
  includeBank = false,
  includePot = false,
  excludePlayer = null,
  label = "Select Player"
}) {
  return (
    <div className="space-y-3">
      <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {players
          .filter(p => p.id !== excludePlayer)
          .map((player) => (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl transition-all min-h-[56px]",
                selected === player.id 
                  ? "bg-white ring-2 ring-emerald-500" 
                  : "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full flex-shrink-0", colorMap[player.color] || 'bg-zinc-500')} />
              <span className={cn(
                "font-semibold truncate text-left",
                selected === player.id ? "text-zinc-900" : "text-white"
              )}>
                {player.name}
              </span>
            </button>
          ))}
        
        {includeBank && (
          <button
            onClick={() => onSelect('bank')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl transition-all min-h-[56px]",
              selected === 'bank' 
                ? "bg-white ring-2 ring-emerald-500" 
                : "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600"
            )}
          >
            <Building2 className={cn(
              "w-5 h-5 flex-shrink-0",
              selected === 'bank' ? "text-zinc-700" : "text-zinc-400"
            )} />
            <span className={cn(
              "font-semibold",
              selected === 'bank' ? "text-zinc-900" : "text-white"
            )}>
              Bank
            </span>
          </button>
        )}
        
        {includePot && (
          <button
            onClick={() => onSelect('pot')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl transition-all min-h-[56px]",
              selected === 'pot' 
                ? "bg-white ring-2 ring-emerald-500" 
                : "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600"
            )}
          >
            <ParkingCircle className={cn(
              "w-5 h-5 flex-shrink-0",
              selected === 'pot' ? "text-amber-600" : "text-amber-500"
            )} />
            <span className={cn(
              "font-semibold",
              selected === 'pot' ? "text-zinc-900" : "text-white"
            )}>
              Free Parking
            </span>
          </button>
        )}
      </div>
    </div>
  );
}