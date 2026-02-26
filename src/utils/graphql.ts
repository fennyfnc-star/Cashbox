import type { PrizeCategoryProps, PrizeDrawNode } from "@/types/graphql.types";
import { GraphQLClient, gql } from "graphql-request";

class WPGraphQLClient {
  link: string;
  client: GraphQLClient;
  refreshToken?: string;
  accessToken?: string | null;
  clientMutationId: string;
  private lastRefresh: number = 0;

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
    await this.ensureAuth();

    const isFiltered = categorySlug !== null && categorySlug !== "";
    const query = FilteredQueryHelper(isFiltered);
    const data = await this.client.request(query, {
      categorySlug,
    });

    console.log(data["prizeDraws"]["nodes"]);
    return data["prizeDraws"]["nodes"];
  }

  async DeletePrizeDrawItem(id: string) {
    await this.ensureAuth();
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
      await this.ensureAuth();

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
    await this.ensureAuth();
    const data = await this.client.request(GET_PRICE_CATEGORIES);
    console.log("Prize Categories:", data);

    return data.prizeCategories.nodes;
  }

  async ensureAuth() {
    const tenMinutes = 10 * 60 * 1000;
    if (!this.accessToken || Date.now() - this.lastRefresh > tenMinutes) {
      await this.refreshAccessToken();
      this.lastRefresh = Date.now();
    }
  }

  async refreshAccessToken() {
    const refreshToken = this.refreshToken;

    if (!refreshToken) {
      console.warn("No refresh token found. Attempting re-login...");
      await this.loginAdmin();
      return;
    }

    const REFRESH_MUTATION = gql`
    mutation RefreshAuthToken($jwtRefreshToken: String!) {
      refreshJwtAuthToken(
        input: { 
          clientMutationId: "${this.clientMutationId}", 
          jwtRefreshToken: $jwtRefreshToken 
        }
      ) {
        authToken
      }
    }
  `;

    try {
      // We use a clean client here because the main client might have an expired header
      const data: any = await this.client.request(REFRESH_MUTATION, {
        jwtRefreshToken: refreshToken,
      });

      const newAccessToken = data.refreshJwtAuthToken.authToken;

      // Update the existing client headers instead of creating a whole new instance
      this.accessToken = newAccessToken;
      this.client.setHeader("Authorization", `Bearer ${newAccessToken}`);

      console.log("Token successfully refreshed.");
    } catch (error) {
      console.error(
        "Refresh failed. Token might be revoked or server is down.",
        error,
      );
      // If refresh fails, the user needs to log in from scratch
      await this.loginAdmin();
    }
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
          boughtFrom
        }
      }
    }
  }
`;
}
