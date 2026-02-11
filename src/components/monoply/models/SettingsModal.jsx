import React, { useState, useEffect } from 'react';
import ActionModal from '../ActionModal';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsModal({ open, onClose, game, onUpdate, onAddPlayer }) {
  const [settings, setSettings] = useState({
    free_parking_enabled: false,
    free_parking_mode: 'basic',
    auto_pot_bonus: false,
    auto_pot_bonus_amount: 500,
    house_sell_percentage: 50
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (game?.settings) {
      setSettings(game.settings);
    }
  }, [game?.settings, open]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Check if auto pot bonus was just enabled and pot is empty
    let newPot = game.free_parking_pot || 0;
    if (settings.free_parking_enabled && settings.auto_pot_bonus && newPot === 0) {
      newPot = settings.auto_pot_bonus_amount;
    }
    
    await onUpdate({ 
      settings,
      free_parking_pot: newPot
    });
    setHasChanges(false);
    onClose();
  };

  return (
    <ActionModal open={open} onClose={() => onClose()} title="Game Settings">
      <div className="space-y-6">
        {/* Add Player Button */}
        <Button
          onClick={() => {
            onClose();
            onAddPlayer();
          }}
          variant="outline"
          className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3"
        >
          <UserPlus className="w-5 h-5" />
          Add Player Mid-Game
        </Button>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* Free Parking Rules */}
        <div className="space-y-4">
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
                    <p className="text-zinc-500 text-sm">Only taxes and chance/community chest penalties</p>
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
                  <p className="text-zinc-500 text-sm mt-0.5">Add money when pot is emptied</p>
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
        <div className="border-t border-zinc-800" />

        {/* Jail Fee */}
        <div className="space-y-3">
          <div>
            <Label className="text-white font-medium">Jail Fee</Label>
            <p className="text-zinc-500 text-sm mt-0.5">Amount to pay to get out of jail</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">$</span>
            <Input
              type="number"
              value={settings.jail_fee || 50}
              onChange={(e) => {
                updateSetting('jail_fee', Number(e.target.value) || 50);
                setHasChanges(true);
              }}
              className="bg-zinc-800 border-zinc-700 text-white w-32 h-12"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

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

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
          >
            Save Changes
          </Button>
        )}
      </div>
    </ActionModal>
  );
}