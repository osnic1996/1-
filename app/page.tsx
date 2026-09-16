"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TopNav from "@/components/TopNav";
import StatusTabs, { TabKey } from "@/components/StatusTabs";
import FilterBar from "@/components/FilterBar";
import CommentCard from "@/components/CommentCard";
import BulkActionBar from "@/components/BulkActionBar";
import { Category, Comment, CommentStatus, Platform } from "@/lib/types";

interface ConnectionInfo {
  connected: boolean;
  pages: { pageId: string; pageName: string; instagramUsername?: string }[];
}

const ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    "Meta 앱 환경 변수가 설정되지 않았어요. .env.local을 확인해주세요 (SETUP_META.md 참고).",
  invalid_state: "인증 요청이 만료되었거나 위조됐어요. 다시 시도해주세요.",
  oauth_failed:
    "Meta 인증에 실패했어요. 앱 설정(리디렉션 URI, 권한)을 확인해주세요.",
};

export default function CommentManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<ConnectionInfo>({
    connected: false,
    pages: [],
  });
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/connection");
      const data = await res.json();
      setConnection({ connected: data.connected, pages: data.pages ?? [] });
    } catch (err) {
      console.error("Failed to load connection status", err);
    }
  }, []);

  useEffect(() => {
    loadComments();
    loadConnection();

    const params = new URLSearchParams(window.location.search);
    const metaError = params.get("meta_error");
    const connected = params.get("connected");
    if (metaError) {
      setBanner({
        type: "error",
        text: ERROR_MESSAGES[metaError] ?? "Meta 연동 중 오류가 발생했어요.",
      });
    } else if (connected) {
      setBanner({ type: "success", text: "Instagram/Facebook 계정을 연결했어요." });
    }
    if (metaError || connected) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loadComments, loadConnection]);

  async function handleDisconnect() {
    await fetch("/api/connection", { method: "DELETE" });
    await Promise.all([loadConnection(), loadComments()]);
  }

  const filteredByCriteria = useMemo(() => {
    return comments.filter((c) => {
      if (platformFilter !== "all" && c.platform !== platformFilter) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      return true;
    });
  }, [comments, platformFilter, categoryFilter]);

  const counts = useMemo(() => {
    const base: Record<CommentStatus, number> = {
      unreviewed: 0,
      pending: 0,
      ai_excluded: 0,
      completed: 0,
    };
    for (const c of filteredByCriteria) {
      base[c.status] += 1;
    }
    return base;
  }, [filteredByCriteria]);

  const visibleComments = useMemo(() => {
    if (activeTab === "all") return filteredByCriteria;
    return filteredByCriteria.filter((c) => c.status === activeTab);
  }, [filteredByCriteria, activeTab]);

  const allVisibleSelected =
    visibleComments.length > 0 && visibleComments.every((c) => selectedIds.has(c.id));

  function resetSelection() {
    setSelectedIds(new Set());
  }

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    resetSelection();
  }

  function handlePlatformChange(value: Platform | "all") {
    setPlatformFilter(value);
    resetSelection();
  }

  function handleCategoryChange(value: Category | "all") {
    setCategoryFilter(value);
    resetSelection();
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleComments.forEach((c) => next.delete(c.id));
      } else {
        visibleComments.forEach((c) => next.add(c.id));
      }
      return next;
    });
  }

  // Real (Meta-backed) comments are moderated server-side — hidden/deleted
  // on the actual Facebook/Instagram comment — in addition to the local
  // status change; sample rows just update local state. The UI updates
  // immediately either way, the API call runs alongside it.
  async function handleMove(targetStatus: CommentStatus) {
    const ids = Array.from(selectedIds);
    setComments((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, status: targetStatus } : c))
    );
    resetSelection();
    try {
      await fetch("/api/comments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", ids, targetStatus }),
      });
    } catch (err) {
      console.error("Failed to sync move to server", err);
    }
  }

  async function handleDelete() {
    const ids = Array.from(selectedIds);
    if (
      comments.some((c) => ids.includes(c.id) && c.source === "meta") &&
      !window.confirm(
        "선택한 댓글 중 실제 Instagram/Facebook 댓글이 포함되어 있어요. 삭제하면 원본에서도 영구적으로 삭제돼요. 계속할까요?"
      )
    ) {
      return;
    }
    setComments((prev) => prev.filter((c) => !ids.includes(c.id)));
    resetSelection();
    try {
      await fetch("/api/comments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids }),
      });
    } catch (err) {
      console.error("Failed to sync delete to server", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {banner && (
          <div
            className={`mb-4 rounded-md px-4 py-2 text-sm ${
              banner.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {banner.text}
          </div>
        )}

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">댓글 관리</h1>
            <p className="mt-1 text-sm text-gray-400">
              {connection.connected
                ? `연결됨 · ${connection.pages
                    .map((p) => p.instagramUsername ?? p.pageName)
                    .join(", ")}`
                : "샘플 데이터 표시 중 · 계정을 연결하면 실제 댓글을 가져와요"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connection.connected ? (
              <button
                onClick={handleDisconnect}
                className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                연결 해제
              </button>
            ) : (
              <a
                href="/api/auth/meta"
                className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                댓글 연결 설정
              </a>
            )}
            <button
              onClick={loadComments}
              disabled={loading}
              className="rounded-md bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "불러오는 중..." : "새로 가져오기"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <StatusTabs active={activeTab} counts={counts} onChange={handleTabChange} />
            <div className="pr-6">
              <FilterBar
                platform={platformFilter}
                category={categoryFilter}
                onPlatformChange={handlePlatformChange}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                className="h-4 w-4 rounded border-gray-300"
              />
              전체 선택 · {selectedIds.size}개
            </label>

            {selectedIds.size > 0 ? (
              <BulkActionBar
                selectedCount={selectedIds.size}
                currentTab={activeTab}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ) : (
              <span className="text-sm text-gray-400">
                댓글을 선택하면 한 번에 처리할 수 있어요.
              </span>
            )}
          </div>

          <div>
            {visibleComments.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-gray-400">
                {loading ? "불러오는 중..." : "표시할 댓글이 없어요."}
              </div>
            ) : (
              visibleComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  selected={selectedIds.has(comment.id)}
                  onToggle={toggleOne}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
