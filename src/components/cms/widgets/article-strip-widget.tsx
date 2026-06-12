import { getArticles } from "@/lib/api/articles";
import type { ArticleStripWidgetProps } from "./article-strip-view";
import { ArticleStripView } from "./article-strip-view";

export type { ArticleStripWidgetProps };

export async function ArticleStripServer({ heading, limit }: ArticleStripWidgetProps) {
  const articles = await getArticles();
  return <ArticleStripView heading={heading} articles={articles.slice(0, limit || 3)} />;
}
