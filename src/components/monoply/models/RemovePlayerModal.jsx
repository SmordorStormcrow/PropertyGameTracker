import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { UserMinus, Users } from "lucide-react";

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

export default function RemovePlayerModal({ open, onClose, game, player, onUpdate }) {
  const [step, setStep] = useState(1); // 1: confirm, 2: choose method, 3: select recipients
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  const otherPlayers = game?.players?.filter(p => p.id !== player?.id) || [];

  const handleRegularDropout = async () => {
    if (!player) return;
    
    const updatedPlayers = game.players.filter(p => p.id !== player.id);
    
    await onUpdate({
      players: updatedPlayers,
      transaction_history: [
        ...(game.transaction_history || []),
        {
          timestamp: new Date().toISOString(),
          type: 'player_removed',
          description: `${player.name} dropped out (funds returned to bank)`,
          amount: player.balance,
          from: player.id,
          to: 'bank'
        }
      ]
    });
    
    resetAndClose();
  };

  const handleDistributeWealth = async () => {
    if (!player || selectedRecipients.length === 0) return;
    
    const totalWealth = player.balance;
    const numRecipients = selectedRecipients.length;
    const amountPerPlayer = Math.floor(totalWealth / numRecipients);
    
    const updatedPlayers = game.players
      .filter(p => p.id !== player.id)
      .map(p => {
        if (selectedRecipients.includes(p.id)) {
          return { ...p, balance: p.balance + amountPerPlayer };
        }
        return p;
      });
    
    const recipientNames = otherPlayers
      .filter(p => selectedRecipients.includes(p.id))
      .map(p => p.name)
      .join(', ');
    
    await onUpdate({
      players: updatedPlayers,
      transaction_history: [
        ...(game.transaction_history || []),
        {
          timestamp: new Date().toISOString(),
          type: 'player_removed_distribute',
          description: `${player.name} dropped out. $${amountPerPlayer.toLocaleString()} each distributed to: ${recipientNames}`,
          amount: amountPerPlayer * numRecipients,
          from: player.id,
          to: 'multiple'
        }
      ]
    });
    
    resetAndClose();
  };

  const toggleRecipient = (playerId) => {
    setSelectedRecipients(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const selectAllPlayers = () => {
    setSelectedRecipients(otherPlayers.map(p => p.id));
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedRecipients([]);
    onClose();
  };

  if (!player) return null;

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Remove Player">
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={cn("w-4 h-4 rounded-full", colorMap[player.color] || 'bg-zinc-500')} />
            <div className="flex-1">
              <p className="text-white font-semibold">{player.name}</p>
              <p className="text-emerald-400 text-sm">${player.balance.toLocaleString()}</p>
            </div>
          </div>

          <p className="text-zinc-400 text-center">Are you sure you want to remove this player?</p>

          <div className="space-y-3">
            <Button
              onClick={() => setStep(2)}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
            >
              <UserMinus className="w-5 h-5 mr-2" />
              Remove Player
            </Button>
            <Button
              onClick={resetAndClose}
              variant="outline"
              className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={cn("w-4 h-4 rounded-full", colorMap[player.color] || 'bg-zinc-500')} />
            <div className="flex-1">
              <p className="text-white font-semibold">{player.name}</p>
              <p className="text-emerald-400 text-sm">${player.balance.toLocaleString()}</p>
            </div>
          </div>

          <p className="text-zinc-400 text-sm text-center">What should happen to their money?</p>

          <div className="space-y-3">
            <Button
              onClick={handleRegularDropout}
              variant="outline"
              className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
            >
              <UserMinus className="w-6 h-6 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Regular Drop Out</p>
                <p className="text-zinc-400 text-sm">Money returns to bank</p>
              </div>
            </Button>

            <Button
              onClick={() => setStep(3)}
              variant="outline"
              className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
            >
              <Users className="w-6 h-6 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Give Wealth to Player(s)</p>
                <p className="text-zinc-400 text-sm">Distribute money to others</p>
              </div>
            </Button>

            <Button
              onClick={resetAndClose}
              variant="ghost"
              className="w-full h-12 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Distributing</p>
            <p className="text-emerald-400 text-xl font-bold">${player.balance.toLocaleString()}</p>
            {selectedRecipients.length > 0 && (
              <p className="text-zinc-500 text-sm mt-1">
                ${Math.floor(player.balance / selectedRecipients.length).toLocaleString()} each
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
              Select Recipients
            </label>
            <Button
              onClick={selectAllPlayers}
              variant="ghost"
              size="sm"
              className="text-emerald-500 hover:text-emerald-400"
            >
              Select All
            </Button>
          </div>

          <div className="space-y-2">
            {otherPlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleRecipient(p.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl transition-all",
                  selectedRecipients.includes(p.id)
                    ? "bg-emerald-600/20 border border-emerald-500"
                    : "bg-zinc-800 hover:bg-zinc-700"
                )}
              >
                <Checkbox 
                  checked={selectedRecipients.includes(p.id)}
                  className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className={cn("w-3 h-3 rounded-full", colorMap[p.color] || 'bg-zinc-500')} />
                <span className="text-white font-medium flex-1 text-left">{p.name}</span>
                <span className="text-zinc-400">${p.balance.toLocaleString()}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={handleDistributeWealth}
            disabled={selectedRecipients.length === 0}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl"
          >
            Distribute & Remove Player
          </Button>
        </div>
      )}
    </ActionModal>
  );
}