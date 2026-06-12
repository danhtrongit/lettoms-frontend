"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Puck, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { clientConfig } from "@/lib/builder/config.client";
import { savePageContentAction } from "@/server/actions/builder";
import { Button } from "@/components/ui/button";

const usePuck = createUsePuck();

interface PageEditorProps {
  page: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published";
    data: Data;
  };
}

function HeaderActions({ page }: PageEditorProps) {
  const appState = usePuck((s) => s.appState);
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const save = async (status: "draft" | "published") => {
    setSaving(true);
    const res = await savePageContentAction(page.id, appState.data, status);
    setSaving(false);
    if (res.ok) {
      toast.success(status === "published" ? "Đã xuất bản" : "Đã lưu nháp");
      router.refresh();
    } else {
      toast.error(res.error ?? "Lưu thất bại");
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/xem-truoc/${page.id}`} target="_blank">
          Xem trước
        </Link>
      </Button>
      <Button variant="outline" size="sm" disabled={saving} onClick={() => save("draft")}>
        Lưu nháp
      </Button>
      <Button size="sm" disabled={saving} onClick={() => save("published")}>
        Xuất bản
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/pages/${page.id}`}>Thoát</Link>
      </Button>
    </>
  );
}

export function PageEditor({ page }: PageEditorProps) {
  return (
    <div className="h-dvh">
      <Puck
        config={clientConfig}
        data={page.data}
        viewports={[
          { width: 375, label: "Mobile", icon: <SmartphoneIcon className="size-4" /> },
          { width: 768, label: "Tablet", icon: <TabletIcon className="size-4" /> },
          { width: 1280, label: "Desktop", icon: <MonitorIcon className="size-4" /> },
        ]}
        overrides={{
          headerActions: () => <HeaderActions page={page} />,
        }}
      />
    </div>
  );
}
