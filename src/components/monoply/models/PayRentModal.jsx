import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';

export default function PayRentModal({ open, onClose, game, onTransaction }) {
  const [step, setStep] = useState(1);
  const [payingPlayer, setPayingPlayer] = useState(null);
  const [receivingPlayer, setReceivingPlayer] = useState(null);
  const [amount, setAmount] = useState('');

  const handleConfirm = async () => {
    if (!payingPlayer || !receivingPlayer || !amount) return;
    
    await onTransaction({
      from: payingPlayer,
      to: receivingPlayer,
      amount: Number(amount),
      type: 'rent',
      description: `Rent payment of $${Number(amount).toLocaleString()}`
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setPayingPlayer(null);
    setReceivingPlayer(null);
    setAmount('');
    onClose();
  };

  const payer = game?.players?.find(p => p.id === payingPlayer);
  const receiver = game?.players?.find(p => p.id === receivingPlayer);

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Pay Rent">
      {step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={payingPlayer}
            onSelect={(id) => {
              setPayingPlayer(id);
              setStep(2);
            }}
            label="Who is paying rent?"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Paying</span>
            <span className="text-white font-semibold">{payer?.name}</span>
          </div>

          <PlayerSelector
            players={game?.players || []}
            selected={receivingPlayer}
            onSelect={(id) => {
              setReceivingPlayer(id);
              setStep(3);
            }}
            excludePlayer={payingPlayer}
            label="Who is receiving rent?"
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">From</span>
              <span className="text-white font-semibold">{payer?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">To</span>
              <span className="text-white font-semibold">{receiver?.name}</span>
            </div>
          </div>
          
          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleConfirm}
          />
        </div>
      )}
    </ActionModal>
  );
}