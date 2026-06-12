import Link from "next/link";
import Image from "next/image";
import { uniqloItemImage } from "@/lib/uniqlo-image";

interface IconTile {
  label: string;
  href: string;
  image: string;
}

// Six curated category tiles with reliable Uniqlo imagery.
const tiles: IconTile[] = [
  { label: "Nữ", href: "/nu", image: uniqloItemImage("484508", "00", 400) },
  { label: "Nam", href: "/nam", image: uniqloItemImage("475296", "09", 400) },
  { label: "AIRism", href: "/nu/do-mac-trong/airism", image: uniqloItemImage("482181", "00", 400) },
  { label: "Bra Top", href: "/nu/do-mac-trong/ao-bra-top", image: uniqloItemImage("465707", "00", 400) },
  { label: "Áo Khoác", href: "/nu/ao-khoac/ao-khoac-nhe", image: uniqloItemImage("484610", "38", 400) },
];

function Tile({ tile }: { tile: IconTile }) {
  return (
    <Link href={tile.href} className="group flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border bg-muted">
        <Image
          src={tile.image}
          alt={tile.label}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 160px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <span className="text-center text-sm font-medium leading-tight group-hover:underline">
        {tile.label}
      </span>
    </Link>
  );
}

export function CategoryTiles() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
        <Tile key={t.label} tile={t} />
      ))}
    </div>
  );
}
