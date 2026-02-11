// src/lib/local-game-storage.js
// Utility for storing Monopoly games in localStorage

const STORAGE_KEY = 'monopoly_games';

export function getAllGames() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAllGames(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function addGame(game) {
  const games = getAllGames();
  games.push(game);
  saveAllGames(games);
}

export function updateGame(id, updates) {
  const games = getAllGames();
  const idx = games.findIndex(g => g.id === id);
  if (idx !== -1) {
    games[idx] = { ...games[idx], ...updates, updated_date: new Date().toISOString() };
    saveAllGames(games);
  }
}

export function deleteGame(id) {
  const games = getAllGames().filter(g => g.id !== id);
  saveAllGames(games);
}

export function getGameById(id) {
  return getAllGames().find(g => g.id === id) || null;
}
