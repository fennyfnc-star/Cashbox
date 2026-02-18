import type {
  CreatePrizeDrawProps,
  PrizeCategoryProps,
  PrizeDrawNode,
} from "@/types/graphql";
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

  async CreatePrizeDrawItem(item: CreatePrizeDrawProps) {
    try {
      await this.refreshAccessToken();
      const data = await this.client.request(CREATE_PRIZE_DRAW, item);
      console.log(data);
    } catch (error: any) {
      console.error("Error create prize item: ", error);
      this.accessToken = null;
    }
  }

  async UploadMediaFile(file: File) {
    try {
      await this.refreshAccessToken();
      const data = await this.client.request(UPLOAD_MEDIA_FILE, file);
      console.log(data);
    } catch (error) {
      console.error("Error on file upload: ", error);
      this.accessToken = null;
    }
  }

  async fetchPrizeDraws(): Promise<PrizeDrawNode[]> {
    await this.refreshAccessToken();
    const data = await this.client.request(GET_PRIZE_DRAWS);

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

const GET_PRIZE_DRAWS = gql`
  query GetPrizeDraws {
    prizeDraws(first: 10) {
      nodes {
        id
        title
        slug
        prizeCategories {
          nodes {
            slug
            name
          }
        }
        prizeItemsManagement {
          itemImage {
            node {
              sourceUrl
              altText
            }
          }
          itemDescription
          itemStatus
          price
          tickets
        }
      }
    }
  }
`;

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

// const GET_FILTERED_PRICE_VIEWS = gql`
//   query GetFilteredPrizeDraws {
//     prizeDraws {
//       edges {
//         node {
//           prizeItemsManagement {
//             itemDescription
//             fieldGroupName
//             itemImage {
//               node {
//                 sourceUrl
//               }
//             }
//             itemStatus
//             price
//             tickets
//             visibility {
//               nodes {
//                 name
//               }
//             }
//           }
//           prizeCategories(where: { slug: %s }) {
//             edges {
//               node {
//                 id
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

const CREATE_PRIZE_DRAW = gql`
  mutation CreatePrizeDraw(
    $title: String!
    $itemDescription: String
    $itemStatus: Boolean
    $price: Float
    $tickets: Int
    $itemCategory: String
  ) {
    createPrizeDraw(
      input: {
        title: $title
        status: PUBLISH
        prizeItemsManagement: {
          itemDescription: $itemDescription
          itemStatus: $itemStatus
          price: $price
          tickets: $tickets
        }
        prizeCategories: { nodes: { name: $itemCategory } }
      }
    ) {
      prizeDraw {
        id
        title
        prizeItemsManagement {
          itemDescription
          itemStatus
          price
          tickets
        }
      }
    }
  }
`;

const UPLOAD_MEDIA_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(input: { file: $file }) {
      mediaItem {
        id
        databaseId
        sourceUrl
        mediaType
        mimeType
      }
    }
  }
`;
