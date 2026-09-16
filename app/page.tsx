"use client";

import { useMemo, useState } from "react";
import TopNav from "@/components/TopNav";
import StatusTabs, { TabKey } from "@/components/StatusTabs";
import FilterBar from "@/components/FilterBar";
import CommentCard from "@/components/CommentCard";
import BulkActionBar from "@/components/BulkActionBar";
import { SAMPLE_COMMENTS } from "@/lib/sample-data";
import { Category, Comment, CommentStatus, Platform } from "@/lib/types";

export default function CommentManagementPage() {
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [activeTab, setActiveTab] = useState<TabKey>("completed");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">(
    "all"
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredByCriteria = useMemo(() => {
    return comments.filter((c) => {
      if (platformFilter !== "all" && c.platform !== platformFilter)
        return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter)
        return false;
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
    visibleComments.length > 0 &&
    visibleComments.every((c) => selectedIds.has(c.id));

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
      if (allVisibleSelected) {
        const next = new Set(prev);
        visibleComments.forEach((c) => next.delete(c.id));
        return next;
      }
      const next = new Set(prev);
      visibleComments.forEach((c) => next.add(c.id));
      return next;
    });
  }

  function handleMove(status: CommentStatus) {
    setComments((prev) =>
      prev.map((c) =>
        selectedIds.has(c.id) ? { ...c, status } : c
      )
    );
    resetSelection();
  }

  function handleDelete() {
    setComments((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    resetSelection();
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">댓글 관리</h1>
            <p className="mt-1 text-sm text-gray-400">
              마지막 수집 9. 16. 17:00 · 매시간 자동 수집
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              댓글 연결 설정
            </button>
            <button className="rounded-md bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800">
              새로 가져오기
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <StatusTabs
              active={activeTab}
              counts={counts}
              onChange={handleTabChange}
            />
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
                표시할 댓글이 없어요.
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
