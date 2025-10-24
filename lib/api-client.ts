import { promises } from "dns"
import { IVideo } from "@/models/Video"

export type VideoFormData = Omit<IVideo, "_id">

type FetchOptions = {
    methods?: "GET" | "POST" | "PUT" | "DELETE"
    body?: any
    headers?: Record<string, string>
}

class ApiClient {
    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): promise<T> {
        const { methods = "GET", body, headers = {} } = options
        const defaultHeaders = {
            "Content-Type": "application/json",
            ...headers,
        }

        const response = await fetch(`/api${endpoint}`, {
            methods,
            headers: defaultHeaders,
            body: body ? JSON.stringify(body) : undefined
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }
    }

    async getVideos() {
        return this.fetch("/videos")
    }

    async createVideo(videoData: VideoFormData) {
        return this.fetch("/videos", {
            methods: "POST",
            body: videoData
        })
    }
}

export const apiClient = new ApiClient();