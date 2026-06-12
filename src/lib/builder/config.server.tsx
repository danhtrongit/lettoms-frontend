import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";
import { SectionWidget } from "@/components/cms/widgets/section-widget";
import { ColumnsWidget } from "@/components/cms/widgets/columns-widget";
import { RichTextServerWidget } from "@/components/cms/widgets/rich-text-server-widget";
import { IconListWidget } from "@/components/cms/widgets/icon-list-widget";
import { FaqWidget } from "@/components/cms/widgets/faq-widget";
import { TestimonialWidget } from "@/components/cms/widgets/testimonial-widget";

/**
 * Render-only config for the public site (<Render> in RSC).
 * MUST define the same component keys as config.client.tsx —
 * commerce widgets here query the DB directly instead of fetching APIs.
 */
export const serverConfig: Config = {
  components: {
    section: {
      fields: {
        content: { type: "slot" },
      },
      render: ({ background, paddingY, contained, content: Content }) => (
        <SectionWidget background={background} paddingY={paddingY} contained={contained}>
          <Content />
        </SectionWidget>
      ),
    },
    columns: {
      fields: {
        column1: { type: "slot" },
        column2: { type: "slot" },
        column3: { type: "slot" },
        column4: { type: "slot" },
      },
      render: ({ count, gap, column1, column2, column3, column4 }) => (
        <ColumnsWidget count={count} gap={gap} slots={[column1, column2, column3, column4]} />
      ),
    },
    heading: { render: ({ text, level, align }) => <HeadingWidget text={text} level={level} align={align} /> },
    spacer: { render: ({ size }) => <SpacerWidget size={size} /> },
    divider: { render: ({ spacing }) => <DividerWidget spacing={spacing} /> },
    button: { render: ({ label, href, variant, align }) => <ButtonWidget label={label} href={href} variant={variant} align={align} /> },
    richText: {
      render: ({ contentJson, contentHtml }) => (
        <RichTextServerWidget contentJson={contentJson} contentHtml={contentHtml} />
      ),
    },
    iconList: {
      render: ({ heading, items }) => <IconListWidget heading={heading} items={items} />,
    },
    faqAccordion: {
      render: ({ heading, items }) => <FaqWidget heading={heading} items={items} />,
    },
    testimonial: {
      render: ({ quote, author, role, avatar }) => (
        <TestimonialWidget quote={quote} author={author} role={role} avatar={avatar} />
      ),
    },
  },
  root: {
    render: ({ children }: { children: React.ReactNode }) => <div className="py-2">{children}</div>,
  },
};
