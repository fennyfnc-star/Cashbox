export type DrawItemProps = {
  id: string;
  title: string;
  slug: string;
};

export type PrizeDrawsQuery = {
  prizeDraws: {
    nodes: PrizeDrawNode[];
  };
};

export type PrizeDrawNode = {
  id: string;
  title: string;
  slug: string;
  prizeItemsManagement: PrizeItem;
  prizeCategories: {
    nodes: PrizeCateogry[];
  };
};

export type CreatePrizeDrawProps = {
  title: string;
  itemDescription: string;
  itemStatus: boolean;
  price: number;
  tickets: number;
  itemCategory: string;
  mediaIds: number[];
};

export type PrizeCateogry = {
  slug: string;
  name: string;
};

export type PrizeItem = {
  itemImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  } | null; // if the image can be empty
  itemDescription: string;
  itemStatus: boolean;
  price: number | null;
  tickets: number | null;
};

export type PrizeCategoryProps = {
  id: string;
  name: string;
  slug: string;
  count: number;
};
