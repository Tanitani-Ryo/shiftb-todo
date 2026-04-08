"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import type { Todo } from "@/types/todo";

type Filter = "all" | "active" | "completed";

export default function TodosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchTodos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUserEmail(user.email ?? "");

    const { data } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    setTodos(data ?? []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    const { data } = await supabase
      .from("todos")
      .insert({ title: newTitle.trim() })
      .select()
      .single();
    if (data) setTodos((prev) => [data, ...prev]);
    setNewTitle("");
    setAdding(false);
  };

  const toggleTodo = async (id: string, is_completed: boolean) => {
    await supabase.from("todos").update({ is_completed: !is_completed }).eq("id", id);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !is_completed } : t))
    );
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.is_completed;
    if (filter === "completed") return t.is_completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.is_completed).length;
  const completedCount = todos.filter((t) => t.is_completed).length;

  return (
    <AppShell email={userEmail}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">タスク</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} 件未完了 · {completedCount} 件完了
          </p>
        </div>

        {/* Add form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
          <form onSubmit={addTodo} className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="新しいタスクを入力..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3ECF8E]/40 focus:border-[#3ECF8E] placeholder-gray-400 transition"
            />
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-5 py-2.5 bg-[#3ECF8E] text-[#111] text-sm font-semibold rounded-lg hover:bg-[#38b87f] disabled:opacity-50 transition-all"
            >
              {adding ? "追加中..." : "追加"}
            </button>
          </form>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                filter === f
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
            </button>
          ))}
        </div>

        {/* Todo list */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-10 h-10 mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <p className="text-sm">タスクがありません</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id, todo.is_completed)}
                    className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.is_completed
                        ? "bg-[#3ECF8E] border-[#3ECF8E]"
                        : "border-gray-300 hover:border-[#3ECF8E]"
                    }`}
                  >
                    {todo.is_completed && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      todo.is_completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.title}
                  </span>
                  <span className="text-[11px] text-gray-400 hidden group-hover:inline">
                    {new Date(todo.created_at).toLocaleDateString("ja-JP")}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    aria-label="削除"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
