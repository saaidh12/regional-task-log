"use client";

import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  variant?: "mobile" | "desktop";
};

export default function LogoutButton({ variant = "desktop" }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="shrink-0 rounded-2xl bg-blue-950 px-3 py-2 text-xs font-black text-white shadow-lg shadow-blue-950/20"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100"
    >
      <LogoutIcon />
      <span>Logout</span>
    </button>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 17l5-5-5-5M15 12H3M21 3v18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}