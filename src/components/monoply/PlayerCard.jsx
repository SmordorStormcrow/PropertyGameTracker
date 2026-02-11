import React from 'react';
import { cn } from "@/lib/utils";

const colorMap = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-400',
  yellow: 'bg-yellow-400',
  lime: 'bg-lime-500',
  green: 'bg-green-600',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-400',
  sky: 'bg-sky-500',
  blue: 'bg-blue-600',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-600',
  fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-400',
  rose: 'bg-rose-500',
  brown: 'bg-amber-800',
  maroon: 'bg-red-900',
  white: 'bg-white',
  gray: 'bg-gray-400',
  black: 'bg-black',
};

export default function PlayerCard({ player, selected, onClick, compact = false }) {
  const bgColor = colorMap[player.color] || 'bg-zinc-500';
  
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-all w-full",
          selected 
            ? "bg-zinc-800 ring-2 ring-emerald-500" 
            : "bg-zinc-800/50 hover:bg-zinc-800"
        )}
      >
        <div className={cn("w-3 h-3 rounded-full", bgColor)} />
        <span className="text-white font-medium flex-1 text-left">{player.name}</span>
        <span className="text-emerald-400 font-bold">
          ${player.balance.toLocaleString()}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 transition-all",
        selected 
          ? "bg-white ring-2 ring-emerald-500 shadow-lg" 
          : "bg-white/90 hover:bg-white shadow"
      )}
    >
      {/* Color stripe */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", bgColor)} />
      
      <div className="pl-3">
        <p className="text-zinc-600 text-sm font-medium">{player.name}</p>
        <p className={cn(
          "text-2xl font-bold tracking-tight",
          player.balance >= 0 ? "text-zinc-900" : "text-red-600"
        )}>
          ${player.balance.toLocaleString()}
        </p>
      </div>
    </button>
  );
}