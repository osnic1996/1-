import { CommentStatus } from "@/lib/types";

export type TabKey = CommentStatus | "all";

interface Props {
  active: TabKey;
  counts: Record<CommentStatus, number>;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "unreviewed", label: "미검토" },
  { key: "pending", label: "판단 보류" },
  { key: "ai_excluded", label: "AI 자동 제외" },
  { key: "completed", label: "처리 완료" },
  { key: "all", label: "전체" },
];

export default function StatusTabs({ active, counts, onChange }: Props) {
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 px-6">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const count = tab.key === "all" ? null : counts[tab.key];
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 border-b-2 py-3 text-sm transition-colors ${
              isActive
                ? "border-gray-900 font-semibold text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {count !== null && (
              <span
                className={`text-xs ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
