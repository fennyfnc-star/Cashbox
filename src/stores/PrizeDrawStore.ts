import type { PrizeCategory, PrizeDrawNode } from "@/types/graphql";
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
  updateDrawItems: async (category: null | string = null) => {
    try {
      const items = await wpgraphql.fetchPrizeDraws(); // your API call
      // todo add the category in query
      if (category) {
        const filteredItems = items.filter((item) =>
          item.prizeCategories.nodes.some((node) => node.name === category),
        );
        set({ drawItems: filteredItems });
      } else {
        set({ drawItems: items }); // set the fetched items
      }
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
