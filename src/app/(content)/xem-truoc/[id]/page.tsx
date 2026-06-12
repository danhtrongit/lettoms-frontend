import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { requireStaff } from "@/lib/auth/rbac";
import { getPageAdmin } from "@/lib/repos/pages.repo";
import { serverConfig } from "@/lib/builder/config.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Xem trước",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const page = await getPageAdmin(id);
  if (!page) notFound();
  if (!page.content) notFound();

  return (
    <>
      <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
        Bản xem trước — {page.status === "draft" ? "trang nháp" : "có thể chứa thay đổi chưa xuất bản"}
      </div>
      <Render config={serverConfig} data={page.content} />
    </>
  );
}
