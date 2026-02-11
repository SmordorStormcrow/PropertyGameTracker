import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addGame } from '@/lib/local-game-storage';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { ArrowLeft, Plus, X, Play, ChevronRight, ChevronLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DEFAULT_STARTING_MONEY = 1500;

// Extended color palette for grid picker (rainbow order + white/grey/black)
const ALL_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'purple', 'fuchsia', 'pink', 'rose',
  'brown', 'maroon', 'white', 'gray', 'black'
];

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

export default function NewGame() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: players, 2: house rules
  const [gameName, setGameName] = useState('');
  const [startingMoney, setStartingMoney] = useState(DEFAULT_STARTING_MONEY.toString());
  const [players, setPlayers] = useState([
    { id: '1', name: '', color: 'red' },
    { id: '2', name: '', color: 'blue' },
  ]);
  const [openColorPicker, setOpenColorPicker] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // House rules settings
  const [settings, setSettings] = useState({
    free_parking_enabled: false,
    free_parking_mode: 'basic',
    auto_pot_bonus: false,
    auto_pot_bonus_amount: 500,
    house_sell_percentage: 50,
    jail_fee: 50
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addPlayer = () => {
    if (players.length >= 8) return;
    const usedColors = players.map(p => p.color);
    const availableColor = ALL_COLORS.find(c => !usedColors.includes(c)) || ALL_COLORS[0];
    setPlayers([...players, { 
      id: Date.now().toString(), 
      name: '', 
      color: availableColor 
    }]);
  };

  const removePlayer = (id) => {
    if (players.length <= 2) return;
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const getUsedColors = (excludePlayerId) => {
    return players.filter(p => p.id !== excludePlayerId).map(p => p.color);
  };

  const handleCreate = async () => {
    const validPlayers = players.filter(p => p.name.trim());
    if (validPlayers.length < 2) return;

    setIsCreating(true);

    const startingAmount = Number(startingMoney) || DEFAULT_STARTING_MONEY;
    const initialPot = settings.free_parking_enabled && settings.auto_pot_bonus 
      ? settings.auto_pot_bonus_amount 
      : 0;

    const id = Date.now().toString();
    const newGame = {
      id,
      name: gameName || `Game ${new Date().toLocaleDateString()}`,
      players: validPlayers.map(p => ({
        ...p,
        balance: startingAmount
      })),
      free_parking_pot: initialPot,
      notes: '',
      settings,
      transaction_history: [],
      updated_date: new Date().toISOString()
    };
    addGame(newGame);
    navigate(createPageUrl('Game') + `?id=${id}`);
  }

  const validPlayers = players.filter(p => p.name.trim());
  const canProceed = validPlayers.length >= 2;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-900">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === 1 ? navigate(createPageUrl('Home')) : setStep(1)}
            className="text-zinc-400 hover:text-white"
          >
            {step === 1 ? <ArrowLeft className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold text-white">
            {step === 1 ? 'New Game' : 'House Rules'}
          </h1>
          <div className="w-10" />
        </div>
        
        {/* Step Indicator */}
        <div className="flex gap-2 px-6 pb-4">
          <div className={cn("h-1 flex-1 rounded-full", step >= 1 ? "bg-emerald-500" : "bg-zinc-800")} />
          <div className={cn("h-1 flex-1 rounded-full", step >= 2 ? "bg-emerald-500" : "bg-zinc-800")} />
        </div>
      </div>

      {step === 1 && (
        <div className="px-6 py-6 pb-32">
          {/* Game Name */}
          <div className="mb-6">
            <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
              Game Name
            </label>
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Saturday Night Monopoly"
              className="mt-2 h-14 bg-zinc-900 border-zinc-800 text-white text-lg placeholder:text-zinc-600 rounded-xl"
            />
          </div>

          {/* Starting Money */}
          <div className="mb-8">
            <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
              Starting Cash Per Player
            </label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-zinc-500 text-xl">$</span>
              <Input
                type="number"
                value={startingMoney}
                onChange={(e) => setStartingMoney(e.target.value)}
                placeholder="1500"
                className="h-14 bg-zinc-900 border-zinc-800 text-white text-lg placeholder:text-zinc-600 rounded-xl"
              />
            </div>
          </div>

          {/* Players */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
                Players ({players.length})
              </label>
              {players.length < 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addPlayer}
                  className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Player
                </Button>
              )}
            </div>

            {players.map((player, index) => {
              const usedColors = getUsedColors(player.id);
              return (
                <div key={player.id} className="bg-zinc-900 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    {/* Color Selector Popover */}
                    <Popover open={openColorPicker === player.id} onOpenChange={(open) => setOpenColorPicker(open ? player.id : null)}>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-10 h-10 rounded-full transition-all min-w-[40px] ring-2 ring-white ring-offset-2 ring-offset-zinc-900",
                            colorMap[player.color]
                          )}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3 bg-zinc-800 border-zinc-700" align="start">
                        <div className="grid grid-cols-5 gap-2">
                          {ALL_COLORS.map((color) => {
                            const isUsed = usedColors.includes(color);
                            const isSelected = player.color === color;
                            if (isUsed) {
                              return <div key={color} className="w-8 h-8" />;
                            }
                            return (
                              <button
                                key={color}
                                onClick={() => {
                                  updatePlayer(player.id, 'color', color);
                                  setOpenColorPicker(null);
                                }}
                                className={cn(
                                  "w-8 h-8 rounded-full transition-all",
                                  colorMap[color],
                                  color === 'white' && "border border-zinc-600",
                                  isSelected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-800",
                                  !isSelected && "hover:scale-110"
                                )}
                              />
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Name Input */}
                    <Input
                      value={player.name}
                      onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      className="flex-1 h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-lg"
                    />

                    {/* Remove Button */}
                    {players.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePlayer(player.id)}
                        className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 min-w-[44px] min-h-[44px]"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-6 py-6 pb-32">
          {/* Free Parking Rules */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Free Parking Rules</Label>
                <p className="text-zinc-500 text-sm mt-0.5">Enable money pot on Free Parking</p>
              </div>
              <Switch
                checked={settings.free_parking_enabled}
                onCheckedChange={(checked) => updateSetting('free_parking_enabled', checked)}
              />
            </div>

            {settings.free_parking_enabled && (
              <div className="ml-0 pl-4 border-l-2 border-zinc-800 space-y-4">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => updateSetting('free_parking_mode', 'basic')}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left",
                      settings.free_parking_mode === 'basic' 
                        ? "bg-emerald-600/20 border border-emerald-500" 
                        : "bg-zinc-800/50 hover:bg-zinc-800"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      settings.free_parking_mode === 'basic' 
                        ? "border-emerald-500" 
                        : "border-zinc-600"
                    )}>
                      {settings.free_parking_mode === 'basic' && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">Basic</p>
                      <p className="text-zinc-500 text-sm">Taxes, jail, and chance/community chest penalties</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('free_parking_mode', 'all_out')}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left",
                      settings.free_parking_mode === 'all_out' 
                        ? "bg-emerald-600/20 border border-emerald-500" 
                        : "bg-zinc-800/50 hover:bg-zinc-800"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      settings.free_parking_mode === 'all_out' 
                        ? "border-emerald-500" 
                        : "border-zinc-600"
                    )}>
                      {settings.free_parking_mode === 'all_out' && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">All Out</p>
                      <p className="text-zinc-500 text-sm">All bank payments go into the pot</p>
                    </div>
                  </button>
                </div>

                {/* Auto Pot Bonus */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto Pot Bonus</Label>
                    <p className="text-zinc-500 text-sm mt-0.5">Add money at start & when emptied</p>
                  </div>
                  <Switch
                    checked={settings.auto_pot_bonus}
                    onCheckedChange={(checked) => updateSetting('auto_pot_bonus', checked)}
                  />
                </div>

                {settings.auto_pot_bonus && (
                  <div>
                    <Label className="text-zinc-400 text-sm">Bonus Amount</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-zinc-500">$</span>
                      <Input
                        type="number"
                        value={settings.auto_pot_bonus_amount}
                        onChange={(e) => updateSetting('auto_pot_bonus_amount', Number(e.target.value))}
                        className="bg-zinc-800 border-zinc-700 text-white w-32"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800 my-6" />

          {/* Jail Fee */}
          <div className="space-y-4 mb-8">
            <div>
              <Label className="text-white font-medium">Jail Fee</Label>
              <p className="text-zinc-500 text-sm mt-0.5">Amount to pay to get out of jail</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">$</span>
              <Input
                type="number"
                value={settings.jail_fee}
                onChange={(e) => updateSetting('jail_fee', Number(e.target.value) || 50)}
                className="bg-zinc-800 border-zinc-700 text-white w-32 h-12"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800 my-6" />

          {/* House Sell Rules */}
          <div className="space-y-4">
            <div>
              <Label className="text-white font-medium">Selling Houses/Hotels</Label>
              <p className="text-zinc-500 text-sm mt-0.5">How much players get back when selling</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => updateSetting('house_sell_percentage', 50)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left",
                  settings.house_sell_percentage === 50 
                    ? "bg-emerald-600/20 border border-emerald-500" 
                    : "bg-zinc-800/50 hover:bg-zinc-800"
                )}
              >
                <div className={cn(
                  "w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  settings.house_sell_percentage === 50 
                    ? "border-emerald-500" 
                    : "border-zinc-600"
                )}>
                  {settings.house_sell_percentage === 50 && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">50% (Standard)</p>
                  <p className="text-zinc-500 text-sm">Official Monopoly rules</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('house_sell_percentage', 100)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left",
                  settings.house_sell_percentage === 100 
                    ? "bg-emerald-600/20 border border-emerald-500" 
                    : "bg-zinc-800/50 hover:bg-zinc-800"
                )}
              >
                <div className={cn(
                  "w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  settings.house_sell_percentage === 100 
                    ? "border-emerald-500" 
                    : "border-zinc-600"
                )}>
                  {settings.house_sell_percentage === 100 && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">100% (House Rule)</p>
                  <p className="text-zinc-500 text-sm">Full refund when selling</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        {step === 1 ? (
          <Button
            onClick={() => setStep(2)}
            disabled={!canProceed}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-2xl"
          >
            <span>Continue to House Rules</span>
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-2xl"
          >
            {isCreating ? (
              'Creating...'
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start Game ({validPlayers.length} players)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}