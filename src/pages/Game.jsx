import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGameById, updateGame as updateGameLocal } from '@/lib/local-game-storage';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings, 
  Home, 
  Building2, 
  Receipt, 
  Gift, 
  ArrowDownUp, 
  ParkingCircle,
  StickyNote,
  TrendingDown,
  Landmark
} from "lucide-react";
import PlayerCard from '@/components/monoply/PlayerCard';

import PurchasePropertyModal from '@/components/monoply/models/PurchasePropertyModal';
import PurchaseHouseModal from '@/components/monoply/models/PurchaseHouseModal';
import PayRentModal from '@/components/monoply/models/PayRentModal';
import BonusModal from '@/components/monoply/models/BonusModal';
import SellMortgageModal from '@/components/monoply/models/SellMortgageModal';
import OtherTransactionModal from '@/components/monoply/models/OtherTransactionModal';
import SettingsModal from '@/components/monoply/models/SettingsModal';
import NotesModal from '@/components/monoply/models/NotesModal';
import FreeParkingModal from '@/components/monoply/models/FreeParkingModal';
import TaxesJailModal from '@/components/monoply/models/TaxesJailModal';
import AddPlayerModal from '@/components/monoply/models/AddPlayerModal';
import RemovePlayerModal from '@/components/monoply/models/RemovePlayerModal';

export default function Game() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');

  const [activeModal, setActiveModal] = useState(null);
  const [playerToRemove, setPlayerToRemove] = useState(null);

  const { data: game, isLoading, refetch } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGameById(gameId),
    enabled: !!gameId,
  });

  const updateGame = async (updates) => {
    if (!gameId) return;
    updateGameLocal(gameId, updates);
    refetch();
    queryClient.invalidateQueries(['games']); // update games list in Home
  };

  const executeTransaction = async ({ from, to, amount, type, description }) => {
    if (!game) return;

    const updatedPlayers = [...game.players];
    let updatedPot = game.free_parking_pot;
    const settings = game.settings || {};

    // Handle 'from' source
    if (from !== 'bank' && from !== 'pot') {
      const playerIndex = updatedPlayers.findIndex(p => p.id === from);
      if (playerIndex !== -1) {
        updatedPlayers[playerIndex].balance -= amount;
      }
    } else if (from === 'pot') {
      updatedPot -= amount;
      // Auto bonus when pot is emptied
      if (updatedPot <= 0 && settings.free_parking_enabled && settings.auto_pot_bonus) {
        updatedPot = settings.auto_pot_bonus_amount || 500;
      }
    }

    // Handle 'to' destination
    if (to !== 'bank' && to !== 'pot') {
      const playerIndex = updatedPlayers.findIndex(p => p.id === to);
      if (playerIndex !== -1) {
        updatedPlayers[playerIndex].balance += amount;
      }
    } else if (to === 'pot') {
      updatedPot += amount;
    }

    const newTransaction = {
      timestamp: new Date().toISOString(),
      type,
      description,
      amount,
      from,
      to
    };

    await updateGame({
      players: updatedPlayers,
      free_parking_pot: updatedPot,
      transaction_history: [...(game.transaction_history || []), newTransaction]
    });
  };

  if (!gameId) {
    navigate(createPageUrl('Home'));
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Game not found
      </div>
    );
  }

  const settings = game.settings || {};

  const actions = [
    { id: 'property', label: 'Purchase Property', icon: Home, color: 'bg-blue-600' },
    { id: 'house', label: 'Purchase House/Hotel', icon: Building2, color: 'bg-purple-600' },
    { id: 'rent', label: 'Pay Rent', icon: Receipt, color: 'bg-orange-600' },
    { id: 'bonus', label: 'Bonus', icon: Gift, color: 'bg-emerald-600' },
    { id: 'taxesjail', label: 'Taxes / Jail Payment', icon: Landmark, color: 'bg-amber-600' },
    { id: 'sell', label: 'Sell / Mortgage', icon: TrendingDown, color: 'bg-rose-600' },
    { id: 'other', label: 'Other Transaction', icon: ArrowDownUp, color: 'bg-zinc-600' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-900">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white truncate max-w-[200px]">
            {game.name}
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveModal('notes')}
              className="text-zinc-400 hover:text-white"
            >
              <StickyNote className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveModal('settings')}
              className="text-zinc-400 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Free Parking Pot - Only show if enabled */}
      {settings.free_parking_enabled && (
        <button
          onClick={() => setActiveModal('freeParking')}
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between hover:from-amber-600/30 hover:to-amber-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <ParkingCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-amber-400/80 text-sm font-medium">Free Parking</p>
              <p className="text-amber-300 text-2xl font-bold">
                ${(game.free_parking_pot || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <span className="text-amber-400/60 text-sm">Tap to collect</span>
        </button>
      )}

      {/* Player Balances */}
      <div className="px-6 mt-6">
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide mb-3">
          Player Balances
        </p>
        <div className="grid grid-cols-2 gap-3">
          {game.players?.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              onClick={() => setPlayerToRemove(player)}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-8">
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide mb-3">
          Actions
        </p>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveModal(action.id)}
              className="w-full flex items-center gap-4 p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PurchasePropertyModal
        open={activeModal === 'property'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <PurchaseHouseModal
        open={activeModal === 'house'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <PayRentModal
        open={activeModal === 'rent'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <BonusModal
        open={activeModal === 'bonus'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <SellMortgageModal
        open={activeModal === 'sell'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <OtherTransactionModal
        open={activeModal === 'other'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <SettingsModal
        open={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        game={game}
        onUpdate={updateGame}
        onAddPlayer={() => setActiveModal('addPlayer')}
      />
      <NotesModal
        open={activeModal === 'notes'}
        onClose={() => setActiveModal(null)}
        game={game}
        onUpdate={updateGame}
      />
      <FreeParkingModal
        open={activeModal === 'freeParking'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
        onUpdate={updateGame}
      />
      <TaxesJailModal
        open={activeModal === 'taxesjail'}
        onClose={() => setActiveModal(null)}
        game={game}
        onTransaction={executeTransaction}
      />
      <AddPlayerModal
        open={activeModal === 'addPlayer'}
        onClose={() => setActiveModal(null)}
        game={game}
        onUpdate={updateGame}
      />
      <RemovePlayerModal
        open={!!playerToRemove}
        onClose={() => setPlayerToRemove(null)}
        game={game}
        player={playerToRemove}
        onUpdate={updateGame}
      />
      </div>
      );
      }