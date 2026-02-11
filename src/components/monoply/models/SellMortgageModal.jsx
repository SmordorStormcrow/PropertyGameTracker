import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';
import QuantitySelector from '../QuantitySelector';
import { Button } from "@/components/ui/button";
import { Home, Building2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SellMortgageModal({ open, onClose, game, onTransaction }) {
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState(1);

  const settings = game?.settings || {};
  const sellPercentage = settings.house_sell_percentage || 50;
  const destination = settings.free_parking_enabled && settings.free_parking_mode === 'all_out' 
    ? 'pot' : 'bank';

  const calculatePayout = () => {
    const baseAmount = Number(amount) * quantity;
    if (actionType === 'sell_houses') {
      return Math.floor(baseAmount * (sellPercentage / 100));
    }
    return baseAmount;
  };

  const handleConfirm = async () => {
    if (!selectedPlayer || !amount) return;

    if (actionType === 'sell_houses') {
      // Player receives money from bank
      await onTransaction({
        from: 'bank',
        to: selectedPlayer,
        amount: calculatePayout(),
        type: 'sell_houses',
        description: `Sold ${quantity} house${quantity > 1 ? 's' : ''}/hotel${quantity > 1 ? 's' : ''} for $${calculatePayout().toLocaleString()} (${sellPercentage}% of cost)`
      });
    } else if (actionType === 'mortgage') {
      // Player receives mortgage value
      await onTransaction({
        from: 'bank',
        to: selectedPlayer,
        amount: Number(amount),
        type: 'mortgage',
        description: `Mortgaged property for $${Number(amount).toLocaleString()}`
      });
    } else if (actionType === 'unmortgage') {
      // Player pays to unmortgage
      await onTransaction({
        from: selectedPlayer,
        to: destination,
        amount: Number(amount),
        type: 'unmortgage',
        description: `Unmortgaged property for $${Number(amount).toLocaleString()}`
      });
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPlayer(null);
    setActionType(null);
    setAmount('');
    setQuantity(1);
    onClose();
  };

  const player = game?.players?.find(p => p.id === selectedPlayer);

  const actions = [
    { id: 'sell_houses', label: 'Sell Houses/Hotels', icon: Building2, desc: `Get ${sellPercentage}% back` },
    { id: 'mortgage', label: 'Mortgage Property', icon: Home, desc: 'Get mortgage value' },
    { id: 'unmortgage', label: 'Unmortgage Property', icon: Undo2, desc: 'Pay to unmortgage' },
  ];

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Sell / Mortgage">
      {step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={(id) => {
              setSelectedPlayer(id);
              setStep(2);
            }}
            label="Select player"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Player</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>

          <div className="space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  setActionType(action.id);
                  setStep(3);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl transition-colors",
                  "bg-zinc-800 hover:bg-zinc-700"
                )}
              >
                <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{action.label}</p>
                  <p className="text-zinc-500 text-sm">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && actionType === 'sell_houses' && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Player</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>

          <div>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide mb-3">
              Original Cost Per House/Hotel
            </p>
            <NumPad
              value={amount}
              onChange={setAmount}
              showConfirm={false}
            />
          </div>

          {amount && (
            <>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                label="Quantity"
              />

              <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Original Value</span>
                  <span className="text-zinc-300">${(Number(amount) * quantity).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Return Rate</span>
                  <span className="text-zinc-300">{sellPercentage}%</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex items-center justify-between">
                  <span className="text-zinc-400">Payout</span>
                  <span className="text-emerald-400 text-xl font-bold">
                    ${calculatePayout().toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
              >
                Confirm Sale
              </Button>
            </>
          )}
        </div>
      )}

      {step === 3 && (actionType === 'mortgage' || actionType === 'unmortgage') && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Player</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>

          <div>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide mb-3">
              {actionType === 'mortgage' ? 'Mortgage Value' : 'Unmortgage Cost'}
            </p>
            <NumPad
              value={amount}
              onChange={setAmount}
              onConfirm={handleConfirm}
            />
          </div>

          {actionType === 'unmortgage' && settings.free_parking_enabled && settings.free_parking_mode === 'all_out' && (
            <p className="text-zinc-500 text-sm text-center">
              Funds go to Free Parking
            </p>
          )}
        </div>
      )}
    </ActionModal>
  );
}