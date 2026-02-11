import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';
import { Button } from "@/components/ui/button";
import { Landmark, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaxesJailModal({ open, onClose, game, onTransaction }) {
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [paymentType, setPaymentType] = useState(null); // 'jail' or 'tax'
  const [amount, setAmount] = useState('');

  const settings = game?.settings || {};
  const jailFee = settings.jail_fee || 50;
  
  // For jail: goes to pot if Free Parking is enabled (both basic and all_out)
  // For tax: goes to pot only if Free Parking is enabled
  const getDestination = () => {
    if (!settings.free_parking_enabled) return 'bank';
    // Both jail and tax go to pot when Free Parking is enabled
    return 'pot';
  };

  const handleJailPayment = async () => {
    if (!selectedPlayer) return;
    
    const destination = getDestination();
    
    await onTransaction({
      from: selectedPlayer,
      to: destination,
      amount: jailFee,
      type: 'jail_payment',
      description: `Jail fee payment of $${jailFee}`
    });

    resetAndClose();
  };

  const handleTaxPayment = async () => {
    if (!selectedPlayer || !amount) return;
    
    const destination = getDestination();
    
    await onTransaction({
      from: selectedPlayer,
      to: destination,
      amount: Number(amount),
      type: 'tax_payment',
      description: `Tax payment of $${Number(amount).toLocaleString()}`
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPlayer(null);
    setPaymentType(null);
    setAmount('');
    onClose();
  };

  const player = game?.players?.find(p => p.id === selectedPlayer);

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Taxes / Jail Payment">
      {step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={(id) => {
              setSelectedPlayer(id);
              setStep(2);
            }}
            label="Who is paying?"
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
              onClick={handleJailPayment}
              className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
            >
              <Lock className="w-7 h-7 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-base">Pay Jail Fee</p>
                <p className="text-orange-200 text-sm">
                  ${jailFee} → {getDestination() === 'pot' ? 'Free Parking' : 'Bank'}
                </p>
              </div>
            </Button>

            <Button
              onClick={() => {
                setPaymentType('tax');
                setStep(3);
              }}
              variant="outline"
              className="w-full h-20 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
            >
              <Landmark className="w-7 h-7 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-base">Pay Tax</p>
                <p className="text-zinc-400 text-sm">
                  Custom amount → {getDestination() === 'pot' ? 'Free Parking' : 'Bank'}
                </p>
              </div>
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Player</span>
              <span className="text-white font-semibold">{player?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Goes to</span>
              <span className="text-white font-semibold">
                {getDestination('tax') === 'pot' ? 'Free Parking' : 'Bank'}
              </span>
            </div>
          </div>
          
          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleTaxPayment}
          />
        </div>
      )}
    </ActionModal>
  );
}