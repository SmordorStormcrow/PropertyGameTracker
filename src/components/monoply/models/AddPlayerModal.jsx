import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import NumPad from '../NumPad';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

export default function AddPlayerModal({ open, onClose, game, onUpdate }) {
  const [step, setStep] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const [startingMoney, setStartingMoney] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const usedColors = game?.players?.map(p => p.color) || [];
  const availableColors = ALL_COLORS.filter(c => !usedColors.includes(c));

  const handleAddPlayer = async () => {
    if (!playerName.trim() || !playerColor || !startingMoney) return;

    const newPlayer = {
      id: Date.now().toString(),
      name: playerName.trim(),
      color: playerColor,
      balance: Number(startingMoney)
    };

    await onUpdate({
      players: [...(game?.players || []), newPlayer],
      transaction_history: [
        ...(game?.transaction_history || []),
        {
          timestamp: new Date().toISOString(),
          type: 'player_added',
          description: `${playerName.trim()} joined the game with $${Number(startingMoney).toLocaleString()}`,
          amount: Number(startingMoney),
          from: 'bank',
          to: newPlayer.id
        }
      ]
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setPlayerName('');
    setPlayerColor('');
    setStartingMoney('');
    onClose();
  };

  // Set default color when opening
  React.useEffect(() => {
    if (open && availableColors.length > 0 && !playerColor) {
      setPlayerColor(availableColors[0]);
    }
  }, [open, availableColors, playerColor]);

  if (availableColors.length === 0) {
    return (
      <ActionModal open={open} onClose={resetAndClose} title="Add Player">
        <div className="text-center py-8">
          <p className="text-zinc-400">No colors available</p>
        </div>
      </ActionModal>
    );
  }

  return (
    <ActionModal open={open} onClose={resetAndClose} title="Add Player">
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
              Player Name
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="mt-2 h-14 bg-zinc-800 border-zinc-700 text-white text-lg placeholder:text-zinc-600 rounded-xl"
              autoFocus
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
              Color
            </label>
            <div className="mt-2">
              <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-12 h-12 rounded-full transition-all ring-2 ring-white ring-offset-2 ring-offset-zinc-900",
                      colorMap[playerColor] || 'bg-zinc-600'
                    )}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 bg-zinc-800 border-zinc-700" align="start">
                  <div className="grid grid-cols-5 gap-2">
                    {ALL_COLORS.map((color) => {
                      const isUsed = usedColors.includes(color);
                      const isSelected = playerColor === color;
                      if (isUsed) {
                        return <div key={color} className="w-8 h-8" />;
                      }
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            setPlayerColor(color);
                            setColorPickerOpen(false);
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
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!playerName.trim() || !playerColor}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl"
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={cn("w-4 h-4 rounded-full", colorMap[playerColor])} />
            <span className="text-white font-semibold">{playerName}</span>
          </div>

          <div>
            <label className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
              Starting Money
            </label>
          </div>

          <NumPad
            value={startingMoney}
            onChange={setStartingMoney}
            onConfirm={handleAddPlayer}
          />
        </div>
      )}
    </ActionModal>
  );
}