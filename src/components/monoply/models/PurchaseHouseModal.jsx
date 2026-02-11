import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';
import QuantitySelector from '../QuantitySelector';
import { Button } from "@/components/ui/button";

export default function PurchaseHouseModal({ open, onClose, game, onTransaction }) {
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [costPerHouse, setCostPerHouse] = useState('');
  const [quantity, setQuantity] = useState(1);

  const settings = game?.settings || {};
  const destination = settings.free_parking_enabled && settings.free_parking_mode === 'all_out' 
    ? 'pot' : 'bank';

  const totalCost = Number(costPerHouse) * quantity;

  const handleConfirm = async () => {
    if (!selectedPlayer || !costPerHouse) return;
    
    await onTransaction({
      from: selectedPlayer,
      to: destination,
      amount: totalCost,
      type: 'house_purchase',
      description: `Purchased ${quantity} house${quantity > 1 ? 's' : ''}/hotel${quantity > 1 ? 's' : ''} for $${totalCost.toLocaleString()}`
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPlayer(null);
    setCostPerHouse('');
    setQuantity(1);
    onClose();
  };

  const player = game?.players?.find(p => p.id === selectedPlayer);

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Purchase House/Hotel">
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

          <div>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide mb-3">
              Cost Per House/Hotel
            </p>
            <NumPad
              value={costPerHouse}
              onChange={setCostPerHouse}
              showConfirm={false}
            />
          </div>

          {costPerHouse && (
            <>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                label="Quantity"
              />

              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Cost</span>
                  <span className="text-emerald-400 text-2xl font-bold">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
              >
                Confirm Purchase
              </Button>

              <p className="text-zinc-500 text-sm text-center">
                Funds go to {destination === 'pot' ? 'Free Parking' : 'Bank'}
              </p>
            </>
          )}
        </div>
      )}
    </ActionModal>
  );
}