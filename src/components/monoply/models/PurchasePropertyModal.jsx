import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';

export default function PurchasePropertyModal({ open, onClose, game, onTransaction }) {
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [amount, setAmount] = useState('');

  const settings = game?.settings || {};
  const destination = settings.free_parking_enabled && settings.free_parking_mode === 'all_out' 
    ? 'pot' : 'bank';

  const handleConfirm = async () => {
    if (!selectedPlayer || !amount) return;
    
    await onTransaction({
      from: selectedPlayer,
      to: destination,
      amount: Number(amount),
      type: 'property_purchase',
      description: `Property purchase for $${Number(amount).toLocaleString()}`
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPlayer(null);
    setAmount('');
    onClose();
  };

  const player = game?.players?.find(p => p.id === selectedPlayer);

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Purchase Property">
      {step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={(id) => {
              setSelectedPlayer(id);
              setStep(2);
            }}
            label="Who is buying?"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Buyer</span>
            <span className="text-white font-semibold">{player?.name}</span>
          </div>
          
          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleConfirm}
          />
          
          <p className="text-zinc-500 text-sm text-center">
            Funds go to {destination === 'pot' ? 'Free Parking' : 'Bank'}
          </p>
        </div>
      )}
    </ActionModal>
  );
}