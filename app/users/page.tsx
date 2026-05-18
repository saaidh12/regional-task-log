import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserStatusButton from "./user-status-button";

export default async function UsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (session.role !== "MAIN_ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
      serviceNumber: true,
      mobileNumber: true,
      username: true,
      rank: true,
      region: true,
      role: true,
      isActive: true,
      disabledAt: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">
              Create and manage staff logins
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
            >
              Dashboard
            </Link>

            <Link
              href="/users/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
            >
              Create User
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="hidden lg:block rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Service No</th>
                <th className="text-left p-4">Mobile</th>
                <th className="text-left p-4">Username</th>
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Region</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="p-4 font-bold text-slate-900">
                    {user.fullName}
                  </td>
                  <td className="p-4">{user.serviceNumber}</td>
                  <td className="p-4">{user.mobileNumber || "-"}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.rank || "-"}</td>
                  <td className="p-4">{user.region || "All"}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <StatusBadge active={user.isActive} />
                  </td>
                  <td className="p-4 text-right">
                    {user.id !== session.id ? (
                      <UserStatusButton
                        userId={user.id}
                        isActive={user.isActive}
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        Current User
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {user.fullName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {user.serviceNumber} • {user.region || "All"}
                  </p>
                </div>

                <StatusBadge active={user.isActive} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info label="Username" value={user.username} />
                <Info label="Mobile" value={user.mobileNumber || "-"} />
                <Info label="Rank" value={user.rank || "-"} />
                <Info label="Role" value={user.role} />
              </div>

              {user.id !== session.id && (
                <div className="mt-5">
                  <UserStatusButton
                    userId={user.id}
                    isActive={user.isActive}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value}</p>
    </div>
  );
}