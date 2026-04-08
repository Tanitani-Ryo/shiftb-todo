"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";

type DayData = {
  label: string;
  created: number;
  completed: number;
};

type Stats = {
  totalTodos: number;
  completedTodos: number;
  completionRate: number;
  todayCreated: number;
  todayCompleted: number;
  diaryCount: number;
  last7Days: DayData[];
};

const toLocalDateStr = (isoStr: string) => {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayLocalStr = () => toLocalDateStr(new Date().toISOString());

export default function StatsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUserEmail(user.email ?? "");

    const [todosRes, diaryRes] = await Promise.all([
      supabase.from("todos").select("id, is_completed, created_at"),
      supabase.from("diary_entries").select("id", { count: "exact", head: true }),
    ]);

    const todos = todosRes.data ?? [];
    const diaryCount = diaryRes.count ?? 0;
    const today = todayLocalStr();

    const totalTodos = todos.length;
    const completedTodos = todos.filter((t) => t.is_completed).length;
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    const todayCreated = todos.filter((t) => toLocalDateStr(t.created_at) === today).length;
    const todayCompleted = todos.filter(
      (t) => t.is_completed && toLocalDateStr(t.created_at) === today
    ).length;

    // Last 7 days
    const last7Days: DayData[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = toLocalDateStr(d.toISOString());
      const label = i === 6 ? "今日" : `${d.getMonth() + 1}/${d.getDate()}`;
      const dayTodos = todos.filter((t) => toLocalDateStr(t.created_at) === dateStr);
      return {
        label,
        created: dayTodos.length,
        completed: dayTodos.filter((t) => t.is_completed).length,
      };
    });

    setStats({ totalTodos, completedTodos, completionRate, todayCreated, todayCompleted, diaryCount, last7Days });
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxVal = stats ? Math.max(...stats.last7Days.map((d) => d.created), 1) : 1;

  const statCards = stats
    ? [
        {
          label: "総タスク数",
          value: stats.totalTodos,
          sub: "登録済み",
          color: "bg-blue-50 text-blue-600",
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          ),
        },
        {
          label: "完了済みタスク",
          value: stats.completedTodos,
          sub: "完了",
          color: "bg-[#3ECF8E]/10 text-[#3ECF8E]",
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ),
        },
        {
          label: "完了率",
          value: `${stats.completionRate}%`,
          sub: "達成",
          color: "bg-purple-50 text-purple-600",
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          ),
        },
        {
          label: "今日追加",
          value: stats.todayCreated,
          sub: `完了 ${stats.todayCompleted} 件`,
          color: "bg-orange-50 text-orange-500",
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
        },
        {
          label: "日記エントリー",
          value: stats.diaryCount,
          sub: "記録済み",
          color: "bg-pink-50 text-pink-500",
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <AppShell email={userEmail}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
                >
                  <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{card.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-800">過去7日間のタスク活動</h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">作成数と完了数の推移</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />
                    作成
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3ECF8E] inline-block" />
                    完了
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3 h-40">
                {stats.last7Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex flex-col gap-0.5 items-center" style={{ height: "120px" }}>
                      {/* Created bar */}
                      <div className="w-full flex flex-col justify-end h-full gap-0.5">
                        <div
                          className="w-full bg-gray-100 rounded-t-sm transition-all"
                          style={{
                            height: `${maxVal > 0 ? (day.created / maxVal) * 100 : 0}%`,
                            minHeight: day.created > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      {/* Completed bar (overlaid concept: show separately) */}
                    </div>
                    <div className="w-full relative" style={{ height: "120px", marginTop: "-120px" }}>
                      <div className="w-full h-full flex flex-col justify-end">
                        <div
                          className="w-full bg-[#3ECF8E] rounded-t-sm transition-all opacity-80"
                          style={{
                            height: `${maxVal > 0 ? (day.completed / maxVal) * 100 : 0}%`,
                            minHeight: day.completed > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-medium mt-1 ${
                        day.label === "今日" ? "text-[#3ECF8E]" : "text-gray-400"
                      }`}
                    >
                      {day.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {day.completed}/{day.created}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-gray-800 mb-4">全体の進捗</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">完了率</span>
                <span className="text-sm font-semibold text-gray-900">{stats.completionRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3ECF8E] rounded-full transition-all duration-700"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-gray-400">
                <span>完了 {stats.completedTodos} 件</span>
                <span>未完了 {stats.totalTodos - stats.completedTodos} 件</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
