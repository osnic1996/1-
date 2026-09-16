import { Comment, Platform } from "./types";

const DELETED_NOTE =
  "외부에서 삭제되었거나 원본에 접근할 수 없는 댓글입니다. 다시 확인되면 기존 검토 상태로 돌아갑니다.";

const USERNAMES = [
  "hanatnim",
  "jieun_92",
  "skincare_lover",
  "minji.daily",
  "yuna_glow",
  "beauty_su",
  "kimcs0812",
  "haeun.log",
  "seoyeon_pick",
  "byul_beauty",
];

const AD_TEMPLATES = [
  "지금 프로필 링크 확인하시면 할인쿠폰 드려요~ DM 주세요",
  "부업으로 월 500 버는법 궁금하시면 프로필 클릭!",
  "같은 제품 반값에 파는 곳 있어요 프로필 확인하세요",
  "저 이걸로 3키로 뺐어요ㅎㅎ 궁금하면 디엠주세요",
  "인생템 발견... 프로필 링크 꼭 보고 가세요",
  "저렴하게 구매하는 법 알려드려요 프로필 참고",
  "이 브랜드 정품 확인법 필요하신분 디엠주세요",
  "재입고 알림 받고 싶으신 분들 프로필 링크로",
];

const COMPLETED_CONTENTS = [
  {
    content: "엥 2주만에 저런 애기피부된다..? 과장 아니고 좋아지긴 하는데 조오금씩.. 5개 세트 사서 네통째 쓰는 사람임 재구맨 보고",
    tag: "검토" as const,
    category: "칭찬" as const,
  },
  {
    content: "그냥 광고라고 함",
    tag: "검토" as const,
    category: "기타" as const,
  },
  {
    content: "거짓말 아니고 내가 엄청 사서씀 과대광고 진짜 사라져야함",
    tag: "검토" as const,
    category: "불만" as const,
  },
  {
    content: "전재산 주세요~",
    tag: "맥락 확인" as const,
    category: "기타" as const,
  },
  {
    content: "이거 성분표 어디서 볼 수 있나요? 민감성 피부인데 궁금해서요",
    tag: "맥락 확인" as const,
    category: "문의" as const,
  },
  {
    content: "3개월 써봤는데 확실히 톤업 되긴 하네요 재구매 의사 있음",
    tag: "검토" as const,
    category: "칭찬" as const,
  },
  {
    content: "배송이 너무 늦어요 일주일 넘게 기다리는 중",
    tag: "검토" as const,
    category: "불만" as const,
  },
  {
    content: "이거 임산부도 써도 되나요? 답변 좀 부탁드려요",
    tag: "맥락 확인" as const,
    category: "문의" as const,
  },
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function makeTimestamp(daysAgo: number, hour: number, minute: number) {
  const d = new Date("2026-09-16T09:00:00+09:00");
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  const label = `9. ${pad(d.getDate())}. ${pad(hour)}:${pad(minute)}`;
  return { iso: d.toISOString(), label };
}

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}_${seq}`;
}

function platformFor(index: number): Platform {
  return index % 4 === 0 ? "facebook" : "instagram";
}

const comments: Comment[] = [];

// 미검토 (unreviewed) - 2건
const unreviewedSeed = [
  {
    content: "이거 어디서 구매할 수 있나요? 공식몰 링크 좀 알려주세요",
    days: 0,
    hour: 8,
    minute: 12,
  },
  {
    content: "가격이 너무 비싸요.. 세일할 때 다시 올게요",
    days: 0,
    hour: 9,
    minute: 30,
  },
];
unreviewedSeed.forEach((s, i) => {
  const { iso, label } = makeTimestamp(s.days, s.hour, s.minute);
  comments.push({
    id: nextId("unreviewed"),
    status: "unreviewed",
    platform: platformFor(i),
    username: USERNAMES[i % USERNAMES.length],
    timestamp: iso,
    timestampLabel: label,
    content: s.content,
    note: "",
    sourceTag: `ig_ws_sl260916_${i + 1}_신규문의`,
    hasOriginal: true,
    category: "문의",
    reviewTag: "신규",
  });
});

// 판단 보류 (pending) - 3건
const pendingSeed = [
  "이거 진짜 효과 있는건지 반신반의.. 써본 분 계신가요",
  "광고인건 알겠는데 성분은 괜찮아 보이네요",
  "가격대비 괜찮은지 판단이 잘 안서네요 리뷰 더 찾아볼게요",
];
pendingSeed.forEach((content, i) => {
  const { iso, label } = makeTimestamp(i + 1, 13 + i, 20);
  comments.push({
    id: nextId("pending"),
    status: "pending",
    platform: platformFor(i + 1),
    username: USERNAMES[(i + 3) % USERNAMES.length],
    timestamp: iso,
    timestampLabel: label,
    content,
    note: "",
    sourceTag: `fb_ws_sl260609_${i + 1}_판단대기`,
    hasOriginal: true,
    category: "기타",
    reviewTag: "검토",
  });
});

// AI 자동 제외 (ai_excluded) - 40건, 스팸/광고성 댓글 생성
for (let i = 0; i < 40; i++) {
  const { iso, label } = makeTimestamp(i % 14, (7 + i) % 24, (i * 7) % 60);
  const contentTemplate = AD_TEMPLATES[i % AD_TEMPLATES.length];
  comments.push({
    id: nextId("ai_excluded"),
    status: "ai_excluded",
    platform: platformFor(i),
    username: `spam_acct_${100 + i}`,
    timestamp: iso,
    timestampLabel: label,
    content: contentTemplate,
    note: "",
    sourceTag: `ig_ws_sl2606${pad((i % 28) + 1)}_${i + 1}_AI제외`,
    hasOriginal: i % 5 !== 0,
    category: i % 3 === 0 ? "스팸" : "광고",
    reviewTag: "AI 제외",
  });
}

// 처리 완료 (completed) - 21건
for (let i = 0; i < 21; i++) {
  const seed = COMPLETED_CONTENTS[i % COMPLETED_CONTENTS.length];
  const { iso, label } = makeTimestamp(i, 22 - (i % 15), 35);
  const hasOriginal = i % 6 !== 0;
  comments.push({
    id: nextId("completed"),
    status: "completed",
    platform: platformFor(i + 2),
    username: USERNAMES[i % USERNAMES.length],
    timestamp: iso,
    timestampLabel: label,
    content: seed.content,
    note: hasOriginal ? "" : DELETED_NOTE,
    sourceTag: `fb_ws_sl260609_${(i % 9) + 1}_${
      seed.category === "칭찬" ? "에기피부" : seed.category === "불만" ? "과대광고" : "전재산"
    }`,
    hasOriginal,
    category: seed.category,
    reviewTag: seed.tag,
  });
}

comments.sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);

export const SAMPLE_COMMENTS: Comment[] = comments;
