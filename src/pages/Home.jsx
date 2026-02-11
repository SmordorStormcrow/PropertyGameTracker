import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllGames, deleteGame } from '@/lib/local-game-storage';
// import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Users, Clock, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [gameToDelete, setGameToDelete] = useState(null);
  
  const { data: games = [], isLoading, refetch } = useQuery({
    queryKey: ['games'],
    queryFn: () => getAllGames(),
  });

  const handleDelete = async () => {
    if (!gameToDelete) return;
    deleteGame(gameToDelete.id);
    setGameToDelete(null);
    refetch();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Monopoly Banker</h1>
        <p className="text-zinc-500 mt-1">Manage your games</p>
      </div>

      <div className="px-6 pb-24">
        {/* New Game Button */}
        <Link to={createPageUrl('NewGame')}>
          <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl mb-6">
            <Plus className="h-5 w-5 mr-2" />
            New Game
          </Button>
        </Link>

        {/* Games List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500">No games yet</p>
            <p className="text-zinc-600 text-sm mt-1">Create a new game to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.id}
                to={createPageUrl('Game') + `?id=${game.id}`}
                className="block"
              >
                <div className="bg-zinc-900 rounded-2xl p-4 hover:bg-zinc-800/80 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">{game.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-zinc-500 text-sm flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {game.players?.length || 0} players
                        </span>
                        <span className="text-zinc-600 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(game.updated_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {/* Player Chips */}
                      <div className="flex gap-1 mt-3">
                        {game.players?.slice(0, 6).map((player, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-400"
                          >
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 min-w-[44px] min-h-[44px]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setGameToDelete(game);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Game?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{gameToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}