import type { CreatePrizeDrawProps } from "@/types/graphql.types";
import { wprest } from "@/utils/wprest";

export const bulkCreatePrizeDrawItems = async (
  status: "draft" | "publish" = "draft",
) => {
  const response = await fetch(
    "src/utils/bulk-json/bulk-create-prize-draw-items.json",
  );

  const items: CreatePrizeDrawProps[] = await response.json();

  if (!items.length) {
    console.log("No items to process.");
    return;
  }

  /* ===============================
     1️⃣ CREATE / RESOLVE CATEGORIES
     =============================== */

  const uniqueCategories = [...new Set(items.map((item) => item.itemCategory))];

  console.log("Resolving categories...");

  const categoryMap: Record<string, number> = {};

  for (const category of uniqueCategories) {
    try {
      const id = await wprest.ResolvePrizeCategoryId(category);
      categoryMap[category] = id;
      console.log(`✔ Category ready: ${category} → ${id}`);
    } catch (error) {
      console.error(`❌ Failed to resolve category: ${category}`, error);
      throw error; // stop execution — categories must exist first
    }
  }

  console.log("✅ All categories resolved\n");

  /* ===============================
     2️⃣ CREATE PRIZE DRAW ITEMS
     =============================== */

  const chunkSize = 5;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (item) => {
        try {
          const categoryId = categoryMap[item.itemCategory];

          const itemWithId: CreatePrizeDrawProps = {
            ...item,
            itemCategory: String(categoryId),
          };

          await wprest.CreatePrizeDrawItem(itemWithId, status, true);

          console.log(`✅ Created: ${item.title}`);
        } catch (error) {
          console.error(`❌ Failed to create item: ${item.title}`, error);
        }
      }),
    );

    console.log(`Processed ${i + chunk.length}/${items.length}`);
  }

  console.log("\n🎉 Bulk creation complete");
};

interface CategoryProps {
  category: string;
  key: string;
}

export const bulkCreatePrizeDrawCategories = async () => {
  const response = await fetch(
    "src/utils/bulk-json/bulk-create-prize-categories.json",
  );

  const items: CategoryProps[] = await response.json();

  if (!items.length) {
    console.log("No categories to process.");
    return;
  }

  const uniqueCategories = [...new Set(items.map((item) => item.category))];

  console.log(`Resolving ${uniqueCategories.length} categories...`);

  const categoryMap: Record<string, number> = {};
  const chunkSize = 5; // 🔥 adjust if needed

  for (let i = 0; i < uniqueCategories.length; i += chunkSize) {
    const chunk = uniqueCategories.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (category) => {
        try {
          const id = await wprest.ResolvePrizeCategoryId(category);
          categoryMap[category] = id;
          console.log(`✔ Category ready: ${category} → ${id}`);
        } catch (error) {
          console.error(`❌ Failed to resolve category: ${category}`, error);
          throw error;
        }
      }),
    );

    console.log(
      `Processed ${Math.min(i + chunkSize, uniqueCategories.length)}/${uniqueCategories.length}`,
    );
  }

  console.log("✅ All categories resolved");
};
