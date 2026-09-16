const NAV_ITEMS = [
  "대시보드",
  "벤치마크",
  "소재 운영",
  "제작 현황",
  "댓글 관리",
  "위닝 보고서",
  "설정",
];

export default function TopNav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-900 text-xs text-white">
              C
            </span>
            Crevity
          </div>
          <nav className="flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = item === "댓글 관리";
              return (
                <span
                  key={item}
                  className={
                    active
                      ? "font-semibold text-gray-900"
                      : "cursor-default text-gray-400"
                  }
                >
                  {item}
                </span>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            스킨로직랩 트리플컨트랙터
            <span className="text-gray-400">▾</span>
          </button>
          <div className="flex flex-col items-end leading-tight">
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              동기화 완료
            </span>
            <span className="text-[11px] text-gray-400">
              2분 전 · 소재 64건
            </span>
          </div>
          <button
            aria-label="알림"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            🔔
          </button>
          <button
            aria-label="테마 전환"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            ◐
          </button>
        </div>
      </div>
    </header>
  );
}
