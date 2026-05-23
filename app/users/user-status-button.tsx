"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserStatusButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    const nextStatus = !isActive;

    const message = isActive
      ? "Disable this login? Old records will remain in the system."
      : "Enable this login again?";

    const ok = window.confirm(message);

    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          isActive: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update user.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Network error. Please check API route.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={updateStatus}
      disabled={loading}
      className={`w-full rounded-2xl px-4 py-3 text-sm font-black disabled:opacity-60 ${
        isActive
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {loading ? "Updating..." : isActive ? "Disable Login" : "Enable Login"}
    </button>
  );
}