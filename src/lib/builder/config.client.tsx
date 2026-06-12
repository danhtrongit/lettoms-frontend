"use client";

import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";

const ALIGN_OPTIONS = [
  { label: "Trái", value: "left" },
  { label: "Giữa", value: "center" },
  { label: "Phải", value: "right" },
];

export const clientConfig: Config = {
  categories: {
    layout: { title: "Bố cục", components: ["spacer", "divider"] },
    basic: { title: "Cơ bản", components: ["heading", "button"] },
    media: { title: "Media", components: [] },
    commerce: { title: "Thương mại", components: [] },
    marketing: { title: "Marketing", components: [] },
  },
  components: {
    heading: {
      label: "Tiêu đề",
      fields: {
        text: { type: "text", label: "Nội dung", contentEditable: true },
        level: {
          type: "select",
          label: "Cấp",
          options: [
            { label: "H1", value: "1" },
            { label: "H2", value: "2" },
            { label: "H3", value: "3" },
            { label: "H4", value: "4" },
          ],
        },
        align: { type: "select", label: "Căn lề", options: ALIGN_OPTIONS },
      },
      defaultProps: { text: "Tiêu đề", level: "2", align: "left" },
      render: ({ text, level, align }) => (
        <HeadingWidget text={text} level={level} align={align} />
      ),
    },
    spacer: {
      label: "Khoảng trống",
      fields: { size: { type: "number", label: "Chiều cao (px)", min: 0 } },
      defaultProps: { size: 48 },
      render: ({ size }) => <SpacerWidget size={size} />,
    },
    divider: {
      label: "Đường kẻ",
      fields: { spacing: { type: "number", label: "Khoảng cách trên/dưới (px)", min: 0 } },
      defaultProps: { spacing: 24 },
      render: ({ spacing }) => <DividerWidget spacing={spacing} />,
    },
    button: {
      label: "Nút bấm",
      fields: {
        label: { type: "text", label: "Nhãn" },
        href: { type: "text", label: "Liên kết" },
        variant: {
          type: "select",
          label: "Kiểu",
          options: [
            { label: "Chính", value: "default" },
            { label: "Viền", value: "outline" },
            { label: "Phụ", value: "secondary" },
          ],
        },
        align: { type: "select", label: "Căn lề", options: ALIGN_OPTIONS },
      },
      defaultProps: { label: "Mua ngay", href: "/nu", variant: "default", align: "left" },
      render: ({ label, href, variant, align }) => (
        <ButtonWidget label={label} href={href} variant={variant} align={align} />
      ),
    },
  },
  root: {
    render: ({ children }: { children: React.ReactNode }) => <div className="py-2">{children}</div>,
  },
};
