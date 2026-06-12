import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/common/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = buildMetadata({
  title: "Hướng Dẫn Chọn Size",
  description: "Bảng size chi tiết giúp bạn chọn đúng kích cỡ tại Letom's.",
  path: "/huong-dan-size",
});

const tops = [
  { size: "XS", chest: "82-85", length: "62" },
  { size: "S", chest: "86-89", length: "64" },
  { size: "M", chest: "90-94", length: "66" },
  { size: "L", chest: "95-100", length: "68" },
  { size: "XL", chest: "101-106", length: "70" },
];

const bottoms = [
  { size: "XS", waist: "64-68", hip: "86-90" },
  { size: "S", waist: "69-73", hip: "91-95" },
  { size: "M", waist: "74-79", hip: "96-101" },
  { size: "L", waist: "80-86", hip: "102-108" },
  { size: "XL", waist: "87-94", hip: "109-115" },
];

export default function SizeGuidePage() {
  return (
    <PageShell
      title="Hướng Dẫn Chọn Size"
      description="Số đo tính bằng cm. Nếu ở giữa hai size, hãy chọn size lớn hơn."
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Trợ giúp", href: "/ho-tro" },
        { label: "Hướng dẫn chọn size" },
      ]}
      narrow
    >
      <Tabs defaultValue="tops">
        <TabsList>
          <TabsTrigger value="tops">Áo</TabsTrigger>
          <TabsTrigger value="bottoms">Quần</TabsTrigger>
        </TabsList>
        <TabsContent value="tops">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Vòng ngực (cm)</TableHead>
                <TableHead>Dài áo (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tops.map((r) => (
                <TableRow key={r.size}>
                  <TableCell className="font-medium">{r.size}</TableCell>
                  <TableCell>{r.chest}</TableCell>
                  <TableCell>{r.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="bottoms">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Vòng eo (cm)</TableHead>
                <TableHead>Vòng mông (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bottoms.map((r) => (
                <TableRow key={r.size}>
                  <TableCell className="font-medium">{r.size}</TableCell>
                  <TableCell>{r.waist}</TableCell>
                  <TableCell>{r.hip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
