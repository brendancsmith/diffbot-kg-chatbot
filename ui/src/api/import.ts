import { apiClient } from "./axios";

interface ImportArticlesPayload {
  category: string;
  size: number;
  tag: string;
  text: string;
}

export async function importArticles(payload: ImportArticlesPayload) {
  try {
    const response = await apiClient.post("/import_articles/", payload);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
