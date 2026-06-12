import type { Product } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StarIcon } from "lucide-react";
import { RichTextContent } from "@/components/common/rich-text-content";

export function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger value="details" className="rounded-none">
          Chi tiết
        </TabsTrigger>
        <TabsTrigger value="materials" className="rounded-none">
          Chất liệu
        </TabsTrigger>
        <TabsTrigger value="care" className="rounded-none">
          Bảo quản
        </TabsTrigger>
        <TabsTrigger value="reviews" className="rounded-none">
          Đánh giá ({product.reviewCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="pt-4 text-sm leading-relaxed text-muted-foreground">
        {product.descriptionHtml ? (
          <RichTextContent html={product.descriptionHtml} className="prose-sm" />
        ) : (
          product.description
        )}
      </TabsContent>
      <TabsContent value="materials" className="pt-4 text-sm leading-relaxed text-muted-foreground">
        {product.materialsHtml ? (
          <RichTextContent html={product.materialsHtml} className="prose-sm" />
        ) : (
          product.materials
        )}
      </TabsContent>
      <TabsContent value="care" className="pt-4 text-sm leading-relaxed text-muted-foreground">
        {product.careHtml ? (
          <RichTextContent html={product.careHtml} className="prose-sm" />
        ) : (
          product.care
        )}
      </TabsContent>
      <TabsContent value="reviews" className="pt-4">
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={
                  i < Math.round(product.rating)
                    ? "size-4 fill-primary text-primary"
                    : "size-4 text-muted-foreground/40"
                }
              />
            ))}
          </div>
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            · {product.reviewCount} đánh giá
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Khách hàng đánh giá cao chất lượng vải và độ bền của sản phẩm này.
        </p>
      </TabsContent>
    </Tabs>
  );
}
