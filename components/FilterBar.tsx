import { CATEGORY_LABELS, Category, Platform } from "@/lib/types";

interface Props {
  platform: Platform | "all";
  category: Category | "all";
  onPlatformChange: (value: Platform | "all") => void;
  onCategoryChange: (value: Category | "all") => void;
}

export default function FilterBar({
  platform,
  category,
  onPlatformChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={platform}
        onChange={(e) => onPlatformChange(e.target.value as Platform | "all")}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
      >
        <option value="all">전체 플랫폼</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
      </select>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as Category | "all")}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
      >
        <option value="all">전체 분류</option>
        {CATEGORY_LABELS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
