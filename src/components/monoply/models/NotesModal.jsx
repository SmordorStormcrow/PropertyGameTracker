import React, { useState, useEffect } from 'react';
import ActionModal from '../ActionModal';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function NotesModal({ open, onClose, game, onUpdate }) {
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open && game) {
      setNotes(game.notes || '');
      setHasChanges(false);
    }
  }, [open, game]);

  const handleSave = async () => {
    await onUpdate({ notes });
    setHasChanges(false);
    onClose();
  };

  return (
    <ActionModal open={open} onClose={() => onClose()} title="Game Notes">
      <div className="space-y-4">
        <p className="text-zinc-400 text-sm">
          Save board positions, game context, or anything to remember when you resume.
        </p>
        
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setHasChanges(true);
          }}
          placeholder="e.g., Sarah on Boardwalk, Mike in jail (2nd turn), next is John's turn..."
          className="min-h-[200px] bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
        />

        {hasChanges && (
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Notes
          </Button>
        )}
      </div>
    </ActionModal>
  );
}