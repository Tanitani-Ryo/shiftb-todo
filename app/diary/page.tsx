"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import type { DiaryEntry } from "@/types/todo";

const formatDate = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

const formatTime = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
};

export default function DiaryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUserEmail(user.email ?? "");

    const { data } = await supabase
      .from("diary_entries")
      .select("*")
      .order("created_at", { ascending: false });

    setEntries(data ?? []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveEntry = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("diary_entries")
      .insert({ content: content.trim() })
      .select()
      .single();
    if (data) setEntries((prev) => [data, ...prev]);
    setContent("");
    setSaving(false);
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("diary_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const charCount = content.length;

  return (
    <AppShell email={userEmail}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">日記</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} 件のエントリー
          </p>
        </div>

        {/* New entry form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#3ECF8E]" />
            <span className="text-[13px] font-medium text-gray-600">
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今日の出来事や気持ちを記録しよう..."
            rows={5}
            className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3ECF8E]/40 focus:border-[#3ECF8E] placeholder-gray-400 resize-none transition leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{charCount} 文字</span>
            <button
              onClick={saveEntry}
              disabled={saving || !content.trim()}
              className="px-5 py-2 bg-[#3ECF8E] text-[#111] text-sm font-semibold rounded-lg hover:bg-[#38b87f] disabled:opacity-50 transition-all"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>

        {/* Entries list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-10 h-10 mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <p className="text-sm">日記がまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-medium text-gray-700">
                      {formatDate(entry.created_at)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatTime(entry.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all"
                    aria-label="削除"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
