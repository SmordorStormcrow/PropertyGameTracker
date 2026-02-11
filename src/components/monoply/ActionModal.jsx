import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ActionModal({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md mx-auto p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-bold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onClose(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}