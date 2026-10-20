import type { PrizeCategoryProps, PrizeDrawNode } from "@/types/graphql.types";
import { GraphQLClient, gql } from "graphql-request";

class WPGraphQLClient {
  link: string;
  client: GraphQLClient;

  constructor(link = `${window.location.origin}/graphql`) {
    this.link = link;
    this.client = new GraphQLClient(link, {
      credentials: "same-origin",
      headers: {
        "X-WP-Nonce": window.cashboxAuth?.nonce ?? "",
      },
    });
  }

  // ================== METHODS =====================

  async fetchPrizeDraws(
    categorySlug: string | null = null,
  ): Promise<PrizeDrawNode[]> {

    const isFiltered = categorySlug !== null && categorySlug !== "";
    const query = FilteredQueryHelper(isFiltered);
    const data = await this.client.request(query, {
      categorySlug,
    });

    console.log(data["prizeDraws"]["nodes"]);
    return data["prizeDraws"]["nodes"];
  }

  async DeletePrizeDrawItem(id: string) {
    const DELETE_PRIZE_DRAW_ITEM = gql`
      mutation DeletePrizeItemStatus($id: ID!) {
        deletePrizeDraw(input: { id: $id }) {
          deletedId
        }
      }
    `;

    // Execute mutation
    const data = await this.client.request(DELETE_PRIZE_DRAW_ITEM, {
      id,
    });

    console.log("Deleted successful:", data);
  }

  async UpdateStatus(id: string, isLive: boolean) {
    const UPDATE_PRIZE_DRAW_STATUS = gql`
      mutation UpdatePrizeDrawStatus($id: ID!, $itemStatus: Boolean!) {
        updatePrizeItemStatus(
          input: { id: $id, itemStatus: $itemStatus }
        ) {
          success
        }
      }
    `;

    try {
      const data = await this.client.request(UPDATE_PRIZE_DRAW_STATUS, {
        id,
        itemStatus: isLive,
      });
      if (!data.updatePrizeItemStatus?.success) {
        throw new Error("WordPress did not confirm the status update.");
      }
      return data;
    } catch (error) {
      console.error("Error updating prize item status:", error);
      const graphQLError = error as {
        response?: { errors?: Array<{ message?: string }> };
      };
      throw new Error(
        graphQLError.response?.errors?.[0]?.message ??
          (error instanceof Error ? error.message : "Unknown GraphQL error"),
      );
    }
  }

  async fetchPrizeCategories(): Promise<PrizeCategoryProps[]> {
    const data = await this.client.request(GET_PRICE_CATEGORIES);
    console.log("Prize Categories:", data);

    return data.prizeCategories.nodes;
  }


}

export const wpgraphql = new WPGraphQLClient();

const GET_PRICE_CATEGORIES = gql`
  query GetPrizeCategories {
    prizeCategories(first: 100) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

function FilteredQueryHelper(isFiltered: boolean = false) {
  return gql`
  query GetFilteredPrizeDraws${isFiltered ? "($categorySlug: [String!]!)" : ""} {
    prizeDraws(
      first: 100
      where: {
        stati: [PUBLISH, DRAFT, PRIVATE]
        ${
          isFiltered
            ? `taxQuery: {
            taxArray: [
              {
                taxonomy: PRIZECATEGORY
                field: SLUG
                terms: $categorySlug
              }
            ]
          }`
            : ""
        }
      }
    ) {
      nodes {
        id
        title
        slug
        modified
        status
        prizeCategories {
          nodes {
            id
            slug
            name
          }
        }
        prizeItemsManagement {
          itemImage {
            node {
              id
              sourceUrl
              altText
            }
          }
          itemDescription
          itemStatus
          price
          stock
          tickets
          boughtFrom
          itemNumber
        }
      }
    }
  }
`;
}
