import type { PrizeCategoryProps, PrizeDrawNode } from "@/types/graphql.types";
import { GraphQLClient, gql } from "graphql-request";

class WPGraphQLClient {
  link: string;
  client: GraphQLClient;
  refreshToken?: string;
  accessToken?: string | null;
  clientMutationId: string;

  constructor(link = "https://cashbox.com.au/graphql") {
    this.link = link;
    this.clientMutationId = "reactWP1ce3g450f";
    this.client = new GraphQLClient(link);
    this.loginAdmin();
  }

  // ================== METHODS =====================

  async fetchPrizeDraws(
    categorySlug: string | null = null,
  ): Promise<PrizeDrawNode[]> {
    await this.refreshAccessToken();

    const isFiltered = categorySlug !== null && categorySlug !== "";

    const data = await this.client.request(FilteredQueryHelper(isFiltered), {
      categorySlug,
    });

    console.log(data["prizeDraws"]["nodes"]);
    return data["prizeDraws"]["nodes"];
  }

  async DeletePrizeDrawItem(id: string) {
    await this.refreshAccessToken();
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
    try {
      // Refresh token first
      await this.refreshAccessToken();

      // GraphQL mutation
      const UPDATE_PRIZE_DRAW_STATUS = gql`
        mutation UpdatePrizeDraw($id: ID!, $itemStatus: Boolean!) {
          updatePrizeItemStatus(input: { id: $id, itemStatus: $itemStatus }) {
            clientMutationId
          }
        }
      `;

      // Execute mutation
      const data = await this.client.request(UPDATE_PRIZE_DRAW_STATUS, {
        id,
        itemStatus: isLive,
      });

      console.log("Mutation successful:", data);
      return data; // optional, return the result
    } catch (error: any) {
      // Handle errors here
      console.error("Error updating prize item status:", error);
      this.accessToken = null;

      // Optional: you can throw or return a structured error
      throw new Error(
        error?.response?.errors?.[0]?.message || "Unknown GraphQL error",
      );
    }
  }

  async loginAdmin() {
    const LOGIN_ADMIN = gql`
      mutation LoginUser {
        login(
          input: {
            clientMutationId: "${this.clientMutationId}"
            username: "fenny"
            password: "M2CaHOO&@&"
          }
        ) {
          authToken
          refreshToken
        }
      }
    `;

    const data = await this.client.request(LOGIN_ADMIN);

    this.client = new GraphQLClient(this.link, {
      headers: {
        Authorization: `Bearer ${data.login.authToken}`,
      },
    });

    this.refreshToken = data.login.refreshToken;
    console.log("user logged in");
  }

  async fetchPrizeCategories(): Promise<PrizeCategoryProps[]> {
    await this.refreshAccessToken();
    const data = await this.client.request(GET_PRICE_CATEGORIES);
    console.log("Prize Categories:", data);

    return data.prizeCategories.nodes;
  }

  async refreshAccessToken() {
    if (this.accessToken) return;

    const refreshToken = this.refreshToken;

    if (!refreshToken || refreshToken === "") {
      this.loginAdmin();

      return;
    }

    const REFRESH_MUTATION = gql`
      mutation RefreshAuthToken($refreshToken: String!) {
        refreshJwtAuthToken(
          input: { clientMutationId: "${this.clientMutationId}", jwtRefreshToken: $refreshToken }
        ) {
          authToken
        }
      }
    `;

    const data = await this.client.request(REFRESH_MUTATION, {
      refreshToken,
    });

    const accessToken = data.refreshJwtAuthToken.authToken;
    this.client = new GraphQLClient(this.link, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    this.accessToken = accessToken;
  }
}

export const wpgraphql = new WPGraphQLClient();

const GET_PRICE_CATEGORIES = gql`
  query GetPrizeCategories {
    prizeCategories {
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
      first: 50
      where: {
        stati: [PUBLISH, DRAFT]
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
        }
      }
    }
  }
`;
}
