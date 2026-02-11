import React from 'react';
import { Button } from "@/components/ui/button";
import { Delete, Check } from "lucide-react";

export default function NumPad({ value, onChange, onConfirm, showConfirm = true }) {
  const handleDigit = (digit) => {
    onChange(value + digit);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'];

  return (
    <div className="w-full">
      {/* Display */}
      <div className="bg-zinc-900 rounded-xl p-4 mb-3">
        <div className="text-right">
          <span className="text-zinc-500 text-2xl mr-1">$</span>
          <span className="text-white text-4xl font-bold tracking-tight">
            {value ? Number(value).toLocaleString() : '0'}
          </span>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          <Button
            key={digit}
            variant="outline"
            className="h-16 text-2xl font-semibold bg-white hover:bg-zinc-100 active:bg-zinc-200 border-zinc-200 text-zinc-900"
            onClick={() => handleDigit(digit)}
          >
            {digit}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-16 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 border-zinc-200"
          onClick={handleBackspace}
        >
          <Delete className="h-6 w-6 text-zinc-600" />
        </Button>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button
          variant="outline"
          className="h-12 text-zinc-500 hover:bg-zinc-100"
          onClick={handleClear}
        >
          Clear
        </Button>
        {showConfirm && (
          <Button
            className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            onClick={onConfirm}
            disabled={!value || value === '0'}
          >
            <Check className="h-5 w-5 mr-2" />
            Confirm
          </Button>
        )}
      </div>
    </div>
  );
}