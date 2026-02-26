import type { CreatePrizeDrawProps } from "@/types/graphql.types";
import { wprest } from "@/utils/wprest";

export const bulkCreatePrizeDrawItems = async (
  status: "draft" | "publish" = "draft",
) => {
  // 1️⃣ Load bulk JSON
  const response = await fetch(
    "src/utils/bulk-json/bulk-create-prize-draw-items.json",
  );
  const items: CreatePrizeDrawProps[] = await response.json();

  const chunkSize = 5;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (item) => {
        try {
          // 2️⃣ Resolve the category ID on the fly
          let categoryId: number;
          try {
            categoryId = await wprest.ResolvePrizeCategoryId(item.itemCategory);
          } catch (err: any) {
            // If category already exists, use existing term_id
            if (err?.code === "term_exists" && err?.data?.term_id) {
              categoryId = err.data.term_id;
              console.warn(
                `Category "${item.itemCategory}" already exists, using existing ID ${categoryId}`,
              );
            } else {
              throw err;
            }
          }

          // 3️⃣ Replace itemCategory with the actual ID
          const itemWithId: CreatePrizeDrawProps = {
            ...item,
            itemCategory: String(categoryId),
          };

          // 4️⃣ Create the prize draw item
          await wprest.bulkCreatePrizeDrawItem(itemWithId, status);
        } catch (error) {
          console.error(`Failed to create item: ${item.title}`, error);
        }
      }),
    );

    console.log(`Processed ${i + chunk.length}/${items.length}`);
  }

  console.log("🎉 Bulk creation complete");
};