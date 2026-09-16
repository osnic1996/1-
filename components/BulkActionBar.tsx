import { CommentStatus, STATUS_LABELS } from "@/lib/types";
import { TabKey } from "./StatusTabs";

interface Props {
  selectedCount: number;
  currentTab: TabKey;
  onMove: (status: CommentStatus) => void;
  onDelete: () => void;
}

const MOVE_TARGETS: CommentStatus[] = [
  "completed",
  "pending",
  "ai_excluded",
  "unreviewed",
];

export default function BulkActionBar({
  selectedCount,
  currentTab,
  onMove,
  onDelete,
}: Props) {
  const targets = MOVE_TARGETS.filter((t) => t !== currentTab);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">
        {selectedCount}개 선택됨
      </span>
      <div className="mx-2 h-4 w-px bg-gray-200" />
      {targets.map((t) => (
        <button
          key={t}
          onClick={() => onMove(t)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {STATUS_LABELS[t]}(으)로 이동
        </button>
      ))}
      <button
        onClick={onDelete}
        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        삭제
      </button>
    </div>
  );
}
