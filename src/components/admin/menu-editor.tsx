"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  Trash2Icon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { saveMenuAction } from "@/server/actions/menus";
import type { MenuNode } from "@/db/schema/cms";

interface MenuEditorProps {
  initialHeader: MenuNode[];
  initialFooter: MenuNode[];
  pageOptions: { label: string; href: string }[];
}

function useMenuState(initial: MenuNode[]) {
  const [items, setItems] = React.useState<MenuNode[]>(initial);
  return { items, setItems };
}

export function MenuEditor({ initialHeader, initialFooter, pageOptions }: MenuEditorProps) {
  const header = useMenuState(initialHeader);
  const footer = useMenuState(initialFooter);
  const [pending, startTransition] = React.useTransition();

  function save(key: "header" | "footer", items: MenuNode[]) {
    const cleaned = items
      .filter((it) => it.label.trim() && it.href.trim())
      .map((it) => ({
        ...it,
        children: it.children?.filter((c) => c.label.trim() && c.href.trim()),
      }));

    startTransition(async () => {
      const res = await saveMenuAction(key, cleaned);
      if (res.ok) {
        toast.success("Đã lưu menu");
      } else {
        toast.error(res.error ?? "Lưu thất bại");
      }
    });
  }

  return (
    <>
      <datalist id="menu-page-options">
        {pageOptions.map((p) => (
          <option key={p.href} value={p.href} label={p.label} />
        ))}
      </datalist>

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="header">
          <MenuTabPanel
            items={header.items}
            setItems={header.setItems}
            onSave={() => save("header", header.items)}
            pending={pending}
          />
        </TabsContent>

        <TabsContent value="footer">
          <MenuTabPanel
            items={footer.items}
            setItems={footer.setItems}
            onSave={() => save("footer", footer.items)}
            pending={pending}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function MenuTabPanel({
  items,
  setItems,
  onSave,
  pending,
}: {
  items: MenuNode[];
  setItems: React.Dispatch<React.SetStateAction<MenuNode[]>>;
  onSave: () => void;
  pending: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIdx = prev.findIndex((_, i) => `item-${i}` === active.id);
      const newIdx = prev.findIndex((_, i) => `item-${i}` === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { label: "", href: "/" }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, patch: Partial<MenuNode>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addChild(parentIdx: number) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === parentIdx
          ? { ...it, children: [...(it.children ?? []), { label: "", href: "/" }] }
          : it
      )
    );
  }

  function removeChild(parentIdx: number, childIdx: number) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === parentIdx
          ? { ...it, children: it.children?.filter((_, ci) => ci !== childIdx) }
          : it
      )
    );
  }

  function updateChild(parentIdx: number, childIdx: number, patch: Partial<MenuNode>) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === parentIdx
          ? {
              ...it,
              children: it.children?.map((c, ci) =>
                ci === childIdx ? { ...c, ...patch } : c
              ),
            }
          : it
      )
    );
  }

  function moveChild(parentIdx: number, childIdx: number, dir: -1 | 1) {
    const target = childIdx + dir;
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== parentIdx || !it.children) return it;
        const ch = [...it.children];
        if (target < 0 || target >= ch.length) return it;
        [ch[childIdx], ch[target]] = [ch[target], ch[childIdx]];
        return { ...it, children: ch };
      })
    );
  }

  const ids = items.map((_, i) => `item-${i}`);

  return (
    <div className="mt-4 space-y-4 rounded-lg border bg-background p-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <MenuItemRow
                key={`item-${idx}`}
                sortableId={`item-${idx}`}
                item={item}
                onUpdate={(p) => updateItem(idx, p)}
                onRemove={() => removeItem(idx)}
                onAddChild={() => addChild(idx)}
                onRemoveChild={(ci) => removeChild(idx, ci)}
                onUpdateChild={(ci, p) => updateChild(idx, ci, p)}
                onMoveChild={(ci, dir) => moveChild(idx, ci, dir)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Chưa có mục nào. Nhấn &quot;Thêm mục&quot; để bắt đầu.
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <PlusIcon className="mr-1.5 size-3.5" />
          Thêm mục
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu menu"}
        </Button>
      </div>
    </div>
  );
}

function MenuItemRow({
  sortableId,
  item,
  onUpdate,
  onRemove,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
  onMoveChild,
}: {
  sortableId: string;
  item: MenuNode;
  onUpdate: (patch: Partial<MenuNode>) => void;
  onRemove: () => void;
  onAddChild: () => void;
  onRemoveChild: (ci: number) => void;
  onUpdateChild: (ci: number, patch: Partial<MenuNode>) => void;
  onMoveChild: (ci: number, dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: sortableId,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="rounded-md border bg-muted/20">
      {/* Parent row */}
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <Input
          className="h-8 flex-1 text-sm"
          placeholder="Nhãn"
          value={item.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
        <Input
          className="h-8 flex-1 text-sm"
          placeholder="/duong-dan"
          list="menu-page-options"
          value={item.href}
          onChange={(e) => onUpdate({ href: e.target.value })}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          title="Thêm mục con"
          onClick={onAddChild}
        >
          <PlusIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      {/* Children */}
      {item.children && item.children.length > 0 && (
        <div className="space-y-1 border-t px-2 pb-2 pt-1 pl-8">
          {item.children.map((child, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <Input
                className="h-7 flex-1 text-xs"
                placeholder="Nhãn con"
                value={child.label}
                onChange={(e) => onUpdateChild(ci, { label: e.target.value })}
              />
              <Input
                className="h-7 flex-1 text-xs"
                placeholder="/duong-dan"
                list="menu-page-options"
                value={child.href}
                onChange={(e) => onUpdateChild(ci, { href: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                disabled={ci === 0}
                onClick={() => onMoveChild(ci, -1)}
              >
                <ChevronUpIcon className="size-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                disabled={ci === (item.children?.length ?? 0) - 1}
                onClick={() => onMoveChild(ci, 1)}
              >
                <ChevronDownIcon className="size-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-destructive hover:text-destructive"
                onClick={() => onRemoveChild(ci)}
              >
                <Trash2Icon className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
