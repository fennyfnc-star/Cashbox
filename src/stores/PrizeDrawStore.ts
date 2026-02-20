import type { PrizeCategory, PrizeDrawNode } from "@/types/graphql.types";
import { wpgraphql } from "@/utils/graphql";
import { create } from "zustand";

interface PrizeDrawStore {
  drawItems: PrizeDrawNode[];
  setDrawItems: (items: PrizeDrawNode[]) => void;
  updateDrawItems: (category?: null | string) => Promise<void>;
  categories: PrizeCategory[];
  updatePrizeCategories: () => void;
}

export const usePrizeDrawStore = create<PrizeDrawStore>((set, get) => ({
  drawItems: [],
  setDrawItems: (items) => set({ drawItems: items }),
  updateDrawItems: async () => {
    try {
      const hash = window.location.hash;
      const queryParams = new URLSearchParams(hash.replace(/^#\//, ""));
      const category = queryParams.get("category");
      console.log("CATEGORY: ", category);
      const items = await wpgraphql.fetchPrizeDraws(category); // your API call

      set({ drawItems: items }); // set the fetched items
    } catch (error) {
      console.error("Failed to update draw items:", error);
    }
  },
  categories: [],
  updatePrizeCategories: async () => {
    if (get().categories && get().categories.length > 0) return;

    try {
      const cats = await wpgraphql.fetchPrizeCategories();
      console.log("Categories:", cats);

      set({ categories: cats });
    } catch (error) {
      console.error("Failed to update draw categories:", error);
    }
  },
}));
