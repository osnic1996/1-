import { Comment } from "@/lib/types";

interface Props {
  comment: Comment;
  selected: boolean;
  onToggle: (id: string) => void;
}

const PLATFORM_LABEL: Record<Comment["platform"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
};

export default function CommentCard({ comment, selected, onToggle }: Props) {
  return (
    <div
      className={`flex gap-3 border-b border-gray-100 px-6 py-4 transition-colors ${
        selected ? "bg-blue-50/50" : "hover:bg-gray-50"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(comment.id)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-blue-600">
              {comment.reviewTag}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-700">
              {PLATFORM_LABEL[comment.platform]}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">@{comment.username}</span>
          </div>
          <span className="shrink-0 text-xs text-gray-400">
            {comment.timestampLabel}
          </span>
        </div>

        <p className="mt-2 text-[15px] font-medium text-gray-900">
          {comment.content}
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0 space-y-0.5">
            {comment.note && (
              <p className="text-xs text-gray-400">{comment.note}</p>
            )}
            <p className="truncate text-xs text-gray-400">
              {comment.sourceTag}
            </p>
          </div>
          {comment.hasOriginal && comment.permalink ? (
            <a
              href={comment.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
            >
              원본 보기
            </a>
          ) : (
            <span className="shrink-0 text-xs font-medium text-blue-600">
              {comment.hasOriginal ? "원본 보기" : "원본 없음"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
