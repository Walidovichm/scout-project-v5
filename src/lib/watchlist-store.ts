import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  watched: string[]; // company IDs
  lastSeenEvents: Record<string, string>; // companyId → last seen event ID (or "" if all seen)
  toggleWatch: (companyId: string) => void;
  isWatched: (companyId: string) => boolean;
  markEventsSeen: (companyId: string, lastEventId: string) => void;
  clearWatchlist: () => void;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watched: [],
      lastSeenEvents: {},
      toggleWatch: (companyId) =>
        set((state) => {
          const isWatched = state.watched.includes(companyId);
          if (isWatched) {
            // Remove from watchlist
            const { [companyId]: _, ...rest } = state.lastSeenEvents;
            return {
              watched: state.watched.filter((id) => id !== companyId),
              lastSeenEvents: rest,
            };
          } else {
            // Add to watchlist — mark all current events as "seen" so only
            // future events trigger notifications
            return {
              watched: [...state.watched, companyId],
              lastSeenEvents: { ...state.lastSeenEvents, [companyId]: "init" },
            };
          }
        }),
      isWatched: (companyId) => get().watched.includes(companyId),
      markEventsSeen: (companyId, lastEventId) =>
        set((state) => ({
          lastSeenEvents: { ...state.lastSeenEvents, [companyId]: lastEventId },
        })),
      clearWatchlist: () => set({ watched: [], lastSeenEvents: {} }),
    }),
    {
      name: "scout-watchlist",
      version: 1,
    }
  )
);
