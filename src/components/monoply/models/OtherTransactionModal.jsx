import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import PlayerSelector from '../PlayerSelector';
import NumPad from '../NumPad';
import { Button } from "@/components/ui/button";
import { Gavel, Users, ArrowDownUp, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function OtherTransactionModal({ open, onClose, game, onTransaction }) {
  const [mode, setMode] = useState(null); // 'auction', 'multiplayer', 'other'
  const [step, setStep] = useState(1);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [amount, setAmount] = useState('');
  const [multiDirection, setMultiDirection] = useState(null); // 'receiving' or 'paying'
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const settings = game?.settings || {};
  const includePot = settings.free_parking_enabled;

  const handleConfirm = async () => {
    if (!from || !to || !amount) return;
    
    await onTransaction({
      from,
      to,
      amount: Number(amount),
      type: 'other',
      description: `Custom transaction of $${Number(amount).toLocaleString()}`
    });

    resetAndClose();
  };

  const handleAuctionConfirm = async () => {
    if (!from || !amount) return;
    
    await onTransaction({
      from,
      to: 'bank',
      amount: Number(amount),
      type: 'auction',
      description: `Auction purchase of $${Number(amount).toLocaleString()}`
    });

    resetAndClose();
  };

  const handleMultiplayerConfirm = async () => {
    if (!selectedPlayer || !amount) return;
    
    const otherPlayers = game?.players?.filter(p => p.id !== selectedPlayer) || [];
    const amountNum = Number(amount);
    
    // Execute transactions for each other player
    for (const player of otherPlayers) {
      if (multiDirection === 'receiving') {
        // Selected player receives from each other player
        await onTransaction({
          from: player.id,
          to: selectedPlayer,
          amount: amountNum,
          type: 'multiplayer_payout',
          description: `Multi-player payout: ${getSourceName(player.id)} paid $${amountNum.toLocaleString()} to ${getSourceName(selectedPlayer)}`
        });
      } else {
        // Selected player pays to each other player
        await onTransaction({
          from: selectedPlayer,
          to: player.id,
          amount: amountNum,
          type: 'multiplayer_payout',
          description: `Multi-player payout: ${getSourceName(selectedPlayer)} paid $${amountNum.toLocaleString()} to ${getSourceName(player.id)}`
        });
      }
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setMode(null);
    setStep(1);
    setFrom(null);
    setTo(null);
    setAmount('');
    setMultiDirection(null);
    setSelectedPlayer(null);
    onClose();
  };

  const getSourceName = (id) => {
    if (id === 'bank') return 'Bank';
    if (id === 'pot') return 'Free Parking';
    return game?.players?.find(p => p.id === id)?.name || 'Unknown';
  };

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Other Transaction">
      {/* Mode Selection */}
      {!mode && (
        <div className="space-y-3">
          <Button
            onClick={() => setMode('auction')}
            variant="outline"
            className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
          >
            <Gavel className="w-6 h-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold">Auction</p>
              <p className="text-zinc-400 text-sm">Player pays bank for auction win</p>
            </div>
          </Button>

          <Button
            onClick={() => setMode('multiplayer')}
            variant="outline"
            className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
          >
            <Users className="w-6 h-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold">Multi-Player Payout</p>
              <p className="text-zinc-400 text-sm">One player pays/receives from all others</p>
            </div>
          </Button>

          <Button
            onClick={() => setMode('other')}
            variant="outline"
            className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
          >
            <ArrowDownUp className="w-6 h-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold">Other</p>
              <p className="text-zinc-400 text-sm">Custom transaction between any sources</p>
            </div>
          </Button>
        </div>
      )}

      {/* Auction Mode */}
      {mode === 'auction' && step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={from}
            onSelect={(id) => {
              setFrom(id);
              setStep(2);
            }}
            label="Who won the auction?"
          />
        </div>
      )}

      {mode === 'auction' && step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Winner</span>
            <span className="text-white font-semibold">{getSourceName(from)}</span>
          </div>
          
          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleAuctionConfirm}
          />
        </div>
      )}

      {/* Multi-Player Mode */}
      {mode === 'multiplayer' && step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={selectedPlayer}
            onSelect={(id) => {
              setSelectedPlayer(id);
              setStep(2);
            }}
            label="Select Player"
          />
        </div>
      )}

      {mode === 'multiplayer' && step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">Player</span>
            <span className="text-white font-semibold">{getSourceName(selectedPlayer)}</span>
          </div>

          <p className="text-zinc-400 text-sm text-center">Is this player receiving or paying?</p>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setMultiDirection('receiving');
                setStep(3);
              }}
              variant="outline"
              className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
            >
              <ArrowDownToLine className="w-6 h-6 flex-shrink-0 text-emerald-400" />
              <div className="text-left">
                <p className="font-semibold">Receiving from All</p>
                <p className="text-zinc-400 text-sm">Each other player pays this amount</p>
              </div>
            </Button>

            <Button
              onClick={() => {
                setMultiDirection('paying');
                setStep(3);
              }}
              variant="outline"
              className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-start gap-4 px-5"
            >
              <ArrowUpFromLine className="w-6 h-6 flex-shrink-0 text-red-400" />
              <div className="text-left">
                <p className="font-semibold">Paying to All</p>
                <p className="text-zinc-400 text-sm">This player pays each other player</p>
              </div>
            </Button>
          </div>
        </div>
      )}

      {mode === 'multiplayer' && step === 3 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Player</span>
              <span className="text-white font-semibold">{getSourceName(selectedPlayer)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Direction</span>
              <span className={multiDirection === 'receiving' ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                {multiDirection === 'receiving' ? 'Receiving from all' : 'Paying to all'}
              </span>
            </div>
          </div>

          <p className="text-zinc-500 text-sm text-center">
            Amount {multiDirection === 'receiving' ? 'from' : 'to'} each player ({(game?.players?.length || 1) - 1} players)
          </p>
          
          <NumPad
            value={amount}
            onChange={setAmount}
            onConfirm={handleMultiplayerConfirm}
          />
        </div>
      )}

      {/* Other Mode (original flow) */}
      {mode === 'other' && step === 1 && (
        <div className="space-y-6">
          <PlayerSelector
            players={game?.players || []}
            selected={from}
            onSelect={(id) => {
              setFrom(id);
              setStep(2);
            }}
            includeBank
            includePot={includePot}
            label="Money Source"
          />
        </div>
      )}

      {mode === 'other' && step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-zinc-400">From</span>
            <span className="text-white font-semibold">{getSourceName(from)}</span>
          </div>

          <PlayerSelector
            players={game?.players || []}
            selected={to}
            onSelect={(id) => {
              setTo(id);
              setStep(3);
            }}
            includeBank
            includePot={includePot}
            excludePlayer={from}
            label="Money Destination"
          />
        </div>
      )}

      {mode === 'other' && step === 3 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">From</span>
              <span className="text-white font-semibold">{getSourceName(from)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">To</span>
              <span className="text-white font-semibold">{getSourceName(to)}</span>
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