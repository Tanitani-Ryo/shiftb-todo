"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const LayoutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navItems = [
  { href: "/stats", label: "ダッシュボード", icon: <LayoutIcon /> },
  { href: "/todos", label: "タスク", icon: <CheckIcon /> },
  { href: "/diary", label: "日記", icon: <EditIcon /> },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-56 h-screen bg-[#111111] flex flex-col fixed left-0 top-0 z-20 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#3ECF8E] flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">MyTodo</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-1 pb-2 text-[10px] font-medium tracking-widest text-[#555] uppercase">
          メニュー
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-[#8a8a8a] hover:text-[#ddd] hover:bg-white/[0.04]"
              }`}
            >
              {item.icon}
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="px-3 py-2 mb-1 rounded-md bg-white/[0.03]">
          <p className="text-[11px] text-[#555] mb-0.5">ログイン中</p>
          <p className="text-[12px] text-[#aaa] truncate">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-[#8a8a8a] hover:text-[#ddd] hover:bg-white/[0.04] transition-all"
        >
          <LogoutIcon />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
