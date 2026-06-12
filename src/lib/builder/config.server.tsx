import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";
import { SectionWidget } from "@/components/cms/widgets/section-widget";
import { ColumnsWidget } from "@/components/cms/widgets/columns-widget";

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
  },
  root: {
    render: ({ children }: { children: React.ReactNode }) => <div className="py-2">{children}</div>,
  },
};
