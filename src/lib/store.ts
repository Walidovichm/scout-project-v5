import { create } from "zustand";

export type View =
  | { kind: "search" }
  | { kind: "discover" }
  | { kind: "watchlist" }
  | { kind: "company"; id: string }
  | { kind: "company-mock"; id: string }
  | { kind: "connections"; id: string }
  | { kind: "money-journey"; id: string }
  | { kind: "timeline"; id: string }
  | { kind: "report"; id: string }
  | { kind: "sources"; id: string }
  | { kind: "about" }
  | { kind: "method" };

interface ScoutState {
  view: View;
  history: View[];
  search: string;
  setSearch: (s: string) => void;
  go: (v: View) => void;
  back: () => void;
  home: () => void;
}

export const useScout = create<ScoutState>((set, get) => ({
  view: { kind: "search" },
  history: [],
  search: "",
  setSearch: (s) => set({ search: s }),
  go: (v) =>
    set((state) => ({
      view: v,
      history: [...state.history, state.view].slice(-20),
      search: "",
    })),
  back: () => {
    const h = get().history;
    if (h.length === 0) return;
    const prev = h[h.length - 1];
    set({ view: prev, history: h.slice(0, -1) });
  },
  home: () => set({ view: { kind: "search" }, history: [], search: "" }),
}));
