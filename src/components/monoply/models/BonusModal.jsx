import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Sparkles } from "lucide-react";

export default function BonusModal({ open, onClose, game, onTransaction }) {
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bonusType, setBonusType] = useState(null);
  const [amount, setAmount] = useState('');

  const handlePassGo = async () => {
    await onTransaction({
      from: 'bank',
      to: selectedPlayer,
      amount: 200,
      type: 'pass_go',
      description: 'Passed GO - collected $200'
    });
    resetAndClose();
  };

  const handleCustomBonus = async () => {
    if (!amount) return;
    await onTransaction({
      from: 'bank',
      to: selectedPlayer,
      amount: Number(amount),
      type: 'bonus',
      description: `Bonus of $${Number(amount).toLocaleString()}`
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPlayer(null);
    setBonusType(null);
    setAmount('');
    onClose();
  };

  const player = game?.players?.find(p => p.id === selectedPlayer);

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Bonus">
      {step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={(id) => {
              setSelectedPlayer(id);
              setStep(2);
            }}
            label="Who receives the bonus?"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Player</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePassGo}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3"
            >
              <CircleDollarSign className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Pass GO</p>
                <p className="text-emerald-200 text-sm">Collect $200</p>
              </div>
            </Button>

            <Button
              onClick={() => {
                setBonusType('custom');
                setStep(3);
              }}
              variant="outline"
              className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Custom Amount</p>
                <p className="text-zinc-400 text-sm">Enter any amount</p>
              </div>
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Player</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>
          
          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleCustomBonus}
          />
        </div>
      )}
    </ActionModal>
  );
}