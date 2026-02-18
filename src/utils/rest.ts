import type { CreatePrizeDrawProps } from "@/types/graphql";
import axios, { type AxiosInstance } from "axios";

class WPRestClient {
  baseURL: string;
  axiosInstance: AxiosInstance;
  token: string | null = null;

  constructor() {
    this.baseURL = "https://cashbox.com.au/wp-json";
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
    });

    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token && config.headers) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  //   ============== METHODS =====================

  async CreatePrizeDrawItem(item: CreatePrizeDrawProps) {
    function decodeGraphQLId(base64Id: string): number {
      // Decode Base64 to string
      const decoded = atob(base64Id); // e.g., "term:666"
      // Extract numeric part
      const numericId = parseInt(decoded.split(":")[1], 10);
      return numericId;
    }
    try {
      const response = await this.axiosInstance.post("/wp/v2/prize_draw", {
        title: item.title,
        status: "publish",
        acf: {
          item_name: item.title,
          item_image: item.mediaIds[0] || null, // first image
          item_description: item.itemDescription,
          item_status: item.itemStatus,
          price: item.price,
          tickets: item.tickets,
        },
        prize_category: [decodeGraphQLId(item.itemCategory)],
      });
      console.log("Created prize item via REST:", response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to create prize item:", err);
      throw err;
    }
  }

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("caption", "Uploaded via React REST API");
    formData.append("alt_text", "Prize image");

    try {
      const response = await this.axiosInstance.post("/wp/v2/media", formData, {
        headers: {
          "Content-Disposition": `attachment; filename="${file.name}"`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("IMAGE RESPONSE: ", response.data);
      return response.data; // returns the uploaded media object
    } catch (err) {
      console.error("Upload failed", err);
      throw err;
    }
  }

  async deleteMedia(mediaId: number) {
    try {
      const response = await this.axiosInstance.delete(
        `/wp/v2/media/${mediaId}`,
        {
          headers: {
            // JWT already added by interceptor
          },
          params: {
            force: true, // permanently delete instead of trash
          },
        },
      );
      return response.data;
    } catch (err) {
      console.error("Failed to delete media:", err);
      throw err;
    }
  }

  async login(username: string, password: string) {
    if (this.token) return;

    try {
      const response = await axios.post(`${this.baseURL}/jwt-auth/v1/token`, {
        username,
        password,
      });

      console.log("LOGIN VIA REST: ", response);

      this.token = response.data.token; // store token in the instance
      return response.data; // return user info + token
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  async GetToken() {
    this.login("fenny", "M2CaHOO&@&");
  }
}

export const wprest = new WPRestClient();
