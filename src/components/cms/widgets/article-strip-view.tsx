import { SectionHeading } from "@/components/common/section-heading";
import { StoryStrip } from "@/components/home/story-strip";
import type { Article } from "@/types";

export interface ArticleStripWidgetProps {
  heading?: string;
  limit?: number;
}

export function ArticleStripView({ heading, articles }: { heading?: string; articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <>
      {heading ? (
        <section className="container-page pt-8">
          <SectionHeading title={heading} align="center" />
        </section>
      ) : null}
      <StoryStrip articles={articles} />
    </>
  );
}
