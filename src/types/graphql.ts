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
    nodes: PrizeCategory[];
  };
};

export type CreatePrizeDrawProps = {
  id?: string;
  title: string;
  itemDescription: string;
  itemStatus: boolean;
  price: number;
  stock: number;
  tickets: number;
  itemCategory: string;
  mediaIds: number[];
};

export type PrizeCategory = {
  id: string;
  slug: string;
  name: string;
};

export type PrizeItem = {
  itemImage: {
    node: {
      id: string;
      sourceUrl: string;
      altText: string;
    };
  } | null; // if the image can be empty
  itemDescription: string;
  itemStatus: boolean;
  price: number | null;
  tickets: number | null;
  stock: number;
};

export type PrizeCategoryProps = {
  id: string;
  name: string;
  slug: string;
  count: number;
};
