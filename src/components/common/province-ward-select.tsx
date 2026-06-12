"use client";
/* eslint-disable react-hooks/set-state-in-effect -- data-fetching effects intentionally sync API → state */

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Option {
  code: number;
  name: string;
}

export interface AddressArea {
  provinceCode?: string;
  provinceName?: string;
  wardCode?: string;
  wardName?: string;
}

interface Props {
  value: AddressArea;
  onChange: (v: AddressArea) => void;
}

/**
 * Two-tier administrative selector (Province → Ward) backed by the
 * cached /api/provinces proxy. The 2025 v2 API dropped the district level.
 */
export function ProvinceWardSelect({ value, onChange }: Props) {
  const [provinces, setProvinces] = React.useState<Option[]>([]);
  const [wards, setWards] = React.useState<Option[]>([]);
  const [loadingP, setLoadingP] = React.useState(false);
  const [loadingW, setLoadingW] = React.useState(false);

  React.useEffect(() => {
    setLoadingP(true);
    fetch("/api/provinces")
      .then((r) => r.json())
      .then((d: Option[]) => setProvinces(Array.isArray(d) ? d : []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingP(false));
  }, []);

  const loadWards = React.useCallback((provinceCode: string) => {
    setLoadingW(true);
    fetch(`/api/provinces/${provinceCode}/wards`)
      .then((r) => r.json())
      .then((d: Option[]) => setWards(Array.isArray(d) ? d : []))
      .catch(() => setWards([]))
      .finally(() => setLoadingW(false));
  }, []);

  // Load wards when a province is already selected (edit mode).
  React.useEffect(() => {
    if (value.provinceCode) loadWards(value.provinceCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.provinceCode]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Combobox
        label="Tỉnh / Thành phố"
        placeholder="Chọn tỉnh/thành"
        loading={loadingP}
        options={provinces}
        selectedCode={value.provinceCode}
        selectedName={value.provinceName}
        onSelect={(opt) => {
          setWards([]);
          onChange({
            provinceCode: String(opt.code),
            provinceName: opt.name,
            wardCode: undefined,
            wardName: undefined,
          });
          loadWards(String(opt.code));
        }}
      />
      <Combobox
        label="Phường / Xã"
        placeholder={value.provinceCode ? "Chọn phường/xã" : "Chọn tỉnh trước"}
        loading={loadingW}
        disabled={!value.provinceCode}
        options={wards}
        selectedCode={value.wardCode}
        selectedName={value.wardName}
        onSelect={(opt) =>
          onChange({
            ...value,
            wardCode: String(opt.code),
            wardName: opt.name,
          })
        }
      />
    </div>
  );
}

function Combobox({
  label,
  placeholder,
  options,
  selectedCode,
  selectedName,
  onSelect,
  loading,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: Option[];
  selectedCode?: string;
  selectedName?: string;
  onSelect: (opt: Option) => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={cn(!selectedName && "text-muted-foreground")}>
              {selectedName || placeholder}
            </span>
            {loading ? (
              <Loader2Icon className="size-4 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDownIcon className="size-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.code}
                    value={opt.name}
                    onSelect={() => {
                      onSelect(opt);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        String(opt.code) === selectedCode ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
