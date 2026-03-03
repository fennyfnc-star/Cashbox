import type { CreatePrizeDrawProps } from "@/types/graphql.types";
import axios, { type AxiosInstance } from "axios";

class WPRestClient {
  baseURL: string;
  axiosInstance: AxiosInstance;
  token: string | null = null;
  private categoryCache: Record<string, number> = {};
  private categoryPromises: Record<string, Promise<number>> = {};

  constructor() {
    this.baseURL = "https://cashbox.com.au/wp-json";
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token && config.headers) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  //   ============== METHODS =====================

  async CreatePrizeDrawItem(
    item: CreatePrizeDrawProps,
    status: "draft" | "publish" = "publish",
    isBulk: Boolean = false,
  ) {
    try {
      const response = await this.axiosInstance.post("/wp/v2/prize_draw", {
        title: item.title,
        status: status,
        acf: {
          item_name: item.title,
          item_image:
            item.mediaIds && item.mediaIds.length > 0 ? item.mediaIds[0] : null, // first image
          item_description: item.itemDescription,
          item_status: item.itemStatus,
          price: item.price,
          stock: item.stock,
          tickets: item.tickets,
          bought_from: item.boughtFrom,
          item_number: item.itemNumber,
        },
        prize_category: isBulk
          ? [item.itemCategory]
          : [decodeGraphQLId(item.itemCategory)],
      });
      console.log("Created prize item via REST:", response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to create prize item:", err);
      throw err;
    }
  }

  async ResolvePrizeCategoryId(categoryName: string): Promise<number> {
    if (this.categoryCache[categoryName]) {
      return this.categoryCache[categoryName];
    }

    if (await this.categoryPromises[categoryName]) {
      return this.categoryPromises[categoryName];
    }

    this.categoryPromises[categoryName] = this._resolveCategory(categoryName);

    const id = await this.categoryPromises[categoryName];

    delete this.categoryPromises[categoryName];

    return id;
  }

  async DeletePrizeDrawItem(item_id: string) {
    try {
      await this.axiosInstance.delete(
        `/wp/v2/prize_draw/${decodeGraphQLId(item_id)}`,
      );
    } catch (err) {
      console.error("Failed to delete prize item:", err);
      throw err;
    }
  }

  async UpdatePrizeDrawItem(
    item: CreatePrizeDrawProps,
    status: "draft" | "publish" = "publish",
  ) {
    if (!item.id) throw new Error("no item id set!");

    try {
      const payload = {
        title: item.title,
        status: status,
        acf: {
          item_name: item.title,
          item_description: item.itemDescription,
          item_status: item.itemStatus,
          price: item.price,
          stock: item.stock,
          tickets: item.tickets,
          bought_from: item.boughtFrom,
          item_number: item.itemNumber
        },
        prize_category: [decodeGraphQLId(item.itemCategory)],
      };

      if (item.mediaIds && item.mediaIds.length > 0) {
        // @ts-ignore
        payload.acf["item_image"] = item.mediaIds[0];
      }

      const response = await this.axiosInstance.patch(
        `/wp/v2/prize_draw/${decodeGraphQLId(item.id)}`,
        payload,
      );

      console.log("Updated prize item via REST:", response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to update prize item:", err);
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

  private async _resolveCategory(categoryName: string): Promise<number> {
    const slug = categoryName.toLowerCase().replace(/\s+/g, "-");

    try {
      // Check if category exists
      const existing = await this.axiosInstance.get(
        `/wp/v2/prize_category?slug=${slug}`,
      );

      if (existing.data.length > 0) {
        const termId = existing.data[0].id;
        this.categoryCache[categoryName] = termId;
        return termId;
      }

      // Create category
      const created = await this.axiosInstance.post(`/wp/v2/prize_category`, {
        name: categoryName,
        slug,
      });

      const termId = created.data.id;
      this.categoryCache[categoryName] = termId;

      console.log(`✅ Created new category: ${categoryName}`);

      return termId;
    } catch (error: any) {
      const wpError = error?.response?.data;

      if (wpError?.code === "term_exists") {
        const termId = wpError?.data?.term_id ?? wpError?.additional_data?.[0];

        if (!termId) {
          throw error;
        }

        console.log(
          `♻️ Category already exists (race handled): ${categoryName} → ${termId}`,
        );

        this.categoryCache[categoryName] = termId;

        return termId;
      }

      throw error;
    }
  }
}

export const wprest = new WPRestClient();

function decodeGraphQLId(base64Id: string): number {
  // Decode Base64 to string
  const decoded = atob(base64Id); // e.g., "term:666"
  // Extract numeric part
  const numericId = parseInt(decoded.split(":")[1], 10);
  return numericId;
}
