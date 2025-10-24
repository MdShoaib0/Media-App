import { IVideo } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetchData<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json(); // ✅ return typed data
  }

  // Fetch all videos
  async getVideos(): Promise<IVideo[]> {
    return this.fetchData<IVideo[]>("/videos");
  }

  // Create a new video
  async createVideo(videoData: VideoFormData): Promise<IVideo> {
    return this.fetchData<IVideo>("/videos", {
      method: "POST",
      body: videoData,
    });
  }
}

export const apiClient = new ApiClient();