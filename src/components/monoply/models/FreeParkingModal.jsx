import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';
import { Button } from "@/components/ui/button";
import { ParkingCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FreeParkingModal({ open, onClose, game, onTransaction, onUpdate }) {
  const [mode, setMode] = useState(null); // 'collect' or 'add'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [amount, setAmount] = useState('');

  const potAmount = game?.free_parking_pot || 0;
  const settings = game?.settings || {};

  const handleCollect = async (playerId) => {
    if (!playerId) return;
    
    const playerName = game?.players?.find(p => p.id === playerId)?.name || 'Player';
    
    // Update player balance and set pot to 0
    const updatedPlayers = game.players.map(p => 
      p.id === playerId ? { ...p, balance: p.balance + potAmount } : p
    );
    
    const newTransaction = {
      timestamp: new Date().toISOString(),
      type: 'free_parking_collect',
      description: `${playerName} collected Free Parking pot of $${potAmount.toLocaleString()}`,
      amount: potAmount,
      from: 'pot',
      to: playerId
    };
    
    await onUpdate({
      players: updatedPlayers,
      free_parking_pot: 0,
      transaction_history: [...(game.transaction_history || []), newTransaction]
    });

    // If auto pot bonus is enabled, add bonus after 3 seconds
    if (settings.free_parking_enabled && settings.auto_pot_bonus) {
      setTimeout(async () => {
        const bonusAmount = settings.auto_pot_bonus_amount || 500;
        // Refetch won't work here, so we update directly
        await onUpdate({
          free_parking_pot: bonusAmount
        });
      }, 3000);
    }

    resetAndClose();
  };

  const handleAddToPot = async () => {
    if (!selectedPlayer || !amount) return;
    
    await onTransaction({
      from: selectedPlayer,
      to: 'pot',
      amount: Number(amount),
      type: 'free_parking_add',
      description: `Added $${Number(amount).toLocaleString()} to Free Parking`
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setMode(null);
    setSelectedPlayer(null);
    setAmount('');
    onClose();
  };

  const player = game?.players?.find(p => p.id === selectedPlayer);

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Free Parking">
      {!mode && (
        <div className="space-y-4">
          {/* Pot Display */}
          <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-500/30 rounded-xl p-6 text-center">
            <ParkingCircle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400/80 text-sm font-medium">Current Pot</p>
            <p className="text-amber-300 text-4xl font-bold">
              ${potAmount.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => setMode('collect')}
              disabled={potAmount === 0}
              className={cn(
                "w-full h-14 font-semibold rounded-xl",
                potAmount > 0 
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              Collect Pot
            </Button>

            <Button
              onClick={() => setMode('add')}
              variant="outline"
              className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Pot
            </Button>
          </div>
        </div>
      )}

      {mode === 'collect' && (
        <div className="space-y-6">
          <div className="bg-amber-600/20 border border-amber-500/30 rounded-xl p-4 text-center">
            <p className="text-amber-400 text-sm">Collecting</p>
            <p className="text-amber-300 text-2xl font-bold">${potAmount.toLocaleString()}</p>
          </div>

          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={(playerId) => handleCollect(playerId)}
            label="Who landed on Free Parking?"
          />
        </div>
      )}

      {mode === 'add' && !selectedPlayer && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={setSelectedPlayer}
            label="Who is paying?"
          />
        </div>
      )}

      {mode === 'add' && selectedPlayer && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Paying</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>

          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleAddToPot}
          />
        </div>
      )}
    </ActionModal>
  );
}