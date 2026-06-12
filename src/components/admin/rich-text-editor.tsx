"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  LinkIcon,
  ImageIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  Undo2Icon,
  Redo2Icon,
  MinusIcon,
} from "lucide-react";
import { tiptapExtensions } from "@/lib/rich-text/extensions";
import { MediaPicker } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: JSONContent | null;
  onChange: (json: JSONContent) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: tiptapExtensions(placeholder),
    content: value ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor) {
    return (
      <div className="min-h-[260px] rounded-md border bg-muted/20" />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1.5">
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={BoldIcon}
        />
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={ItalicIcon}
        />
        <ToolbarBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={StrikethroughIcon}
        />
        <Divider />
        <ToolbarBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading2Icon}
        />
        <ToolbarBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={Heading3Icon}
        />
        <Divider />
        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={ListIcon}
        />
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrderedIcon}
        />
        <ToolbarBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={QuoteIcon}
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={MinusIcon}
        />
        <Divider />
        <ToolbarBtn
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          icon={AlignLeftIcon}
        />
        <ToolbarBtn
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          icon={AlignCenterIcon}
        />
        <ToolbarBtn
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          icon={AlignRightIcon}
        />
        <Divider />
        <ToolbarBtn
          active={editor.isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Nhập URL liên kết:", prev ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          icon={LinkIcon}
        />
        <MediaPicker
          trigger={
            <button
              type="button"
              className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Chèn ảnh"
            >
              <ImageIcon className="size-4" />
            </button>
          }
          onSelect={(urls) => {
            if (urls[0]) editor.chain().focus().setImage({ src: urls[0] }).run();
          }}
        />
        <Divider />
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo2Icon}
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo2Icon}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  icon: Icon,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}
