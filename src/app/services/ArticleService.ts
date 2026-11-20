import axios from "axios";
import { serverApi } from "../../lib/config";
import { Article, ArticleCard } from "../../lib/types/article";

/** News / blog API (published articles only) */
class ArticleService {
  private readonly path = serverApi;

  public async getArticles(input: { page?: number; limit?: number; tag?: string }): Promise<ArticleCard[]> {
    const params: Record<string, string | number> = { page: input.page ?? 1, limit: input.limit ?? 9 };
    if (input.tag) params.tag = input.tag;
    const result = await axios.get(`${this.path}/article/all`, { params });
    return result.data;
  }

  public async getTags(): Promise<{ tag: string; count: number }[]> {
    const result = await axios.get(`${this.path}/article/tags`);
    return result.data;
  }

  public async getArticle(slug: string): Promise<Article> {
    const result = await axios.get(`${this.path}/article/${encodeURIComponent(slug)}`);
    return result.data;
  }
}

export default ArticleService;
