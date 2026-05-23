import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
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

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { mustChangePassword: true },
  });

  if (dbUser?.mustChangePassword) {
    redirect("/change-password");
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

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const disabledUsers = users.filter((user) => !user.isActive).length;
  const mainAdmins = users.filter((user) => user.role === "MAIN_ADMIN").length;
  const staffUsers = users.filter((user) => user.role === "STAFF").length;

  return (
    <AppShell
      title="Users"
      subtitle="Create and manage staff logins"
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                  Admin Panel
                </p>

                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                  User Management
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
                  Create staff accounts, review login details, and enable or
                  disable access.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20"
                >
                  Dashboard
                </Link>

                <Link
                  href="/users/new"
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 hover:bg-blue-50"
                >
                  + Create User
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <SummaryCard title="Total Users" value={totalUsers} />
          <SummaryCard title="Active" value={activeUsers} tone="emerald" />
          <SummaryCard title="Disabled" value={disabledUsers} tone="red" />
          <SummaryCard title="Main Admins" value={mainAdmins} />
          <SummaryCard title="Staff" value={staffUsers} />
        </div>

        <details className="group mt-5 rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">
                User Access Rules
              </p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Current logged-in admin is protected. Other users can be
                disabled or enabled.
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RuleBox
              title="Create Users"
              text="Only Main Admin can create new user accounts."
            />
            <RuleBox
              title="Disable Users"
              text="Disable user access without deleting old records."
            />
            <RuleBox
              title="Protected Account"
              text="You cannot disable the account you are currently using."
            />
          </div>
        </details>

        <div className="mt-5 hidden overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-[1350px] text-sm">
              <thead className="bg-blue-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[190px] p-4 text-left">Name</th>
                  <th className="w-[110px] p-4 text-left">Service No</th>
                  <th className="w-[115px] p-4 text-left">Mobile</th>
                  <th className="w-[140px] p-4 text-left">Username</th>
                  <th className="w-[100px] p-4 text-left">Rank</th>
                  <th className="w-[80px] p-4 text-left">Region</th>
                  <th className="w-[110px] p-4 text-left">Role</th>
                  <th className="w-[110px] p-4 text-left">Status</th>
                  <th className="w-[220px] p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isCurrentUser = user.id === session.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-t border-blue-50 hover:bg-blue-50/40"
                    >
                      <td className="p-4 align-top">
                        <p className="break-words font-black text-slate-900">
                          {user.fullName}
                        </p>

                        {isCurrentUser && (
                          <p className="mt-1 text-xs font-black text-blue-600">
                            Current Logged-in User
                          </p>
                        )}
                      </td>

                      <td className="p-4 align-top font-bold text-slate-700">
                        {user.serviceNumber}
                      </td>

                      <td className="p-4 align-top font-bold text-slate-700">
                        {user.mobileNumber || "-"}
                      </td>

                      <td className="p-4 align-top font-bold text-slate-700">
                        {user.username}
                      </td>

                      <td className="p-4 align-top font-bold text-slate-700">
                        {user.rank || "-"}
                      </td>

                      <td className="p-4 align-top font-bold text-slate-700">
                        {user.region || "All"}
                      </td>

                      <td className="p-4 align-top">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="p-4 align-top">
                        <StatusBadge active={user.isActive} />
                      </td>

                      <td className="p-4 align-top text-right">
                        {isCurrentUser ? (
                          <span className="inline-flex rounded-2xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-500">
                            Protected
                          </span>
                        ) : (
                          <UserStatusButton
                            userId={user.id}
                            isActive={user.isActive}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:hidden">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === session.id}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function UserCard({
  user,
  isCurrentUser,
}: {
  user: {
    id: string;
    fullName: string;
    serviceNumber: string;
    mobileNumber: string | null;
    username: string;
    rank: string | null;
    region: string | null;
    role: string;
    isActive: boolean;
    disabledAt: Date | null;
    createdAt: Date;
  };
  isCurrentUser: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            {user.serviceNumber}
          </p>

          <h2 className="mt-2 break-words text-xl font-black text-slate-900">
            {user.fullName}
          </h2>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {user.region || "All Regions"} • {user.rank || "No rank"}
          </p>
        </div>

        <StatusBadge active={user.isActive} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Info label="Username" value={user.username} />
        <Info label="Mobile" value={user.mobileNumber || "-"} />
        <Info label="Role" value={formatRole(user.role)} />
        <Info label="Created" value={formatDate(user.createdAt)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={user.role} />

        {isCurrentUser && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            Current User
          </span>
        )}

        {!user.isActive && user.disabledAt && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
            Disabled {formatDate(user.disabledAt)}
          </span>
        )}
      </div>

      <div className="mt-5">
        {isCurrentUser ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-500">
            Current user is protected
          </div>
        ) : (
          <UserStatusButton userId={user.id} isActive={user.isActive} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  tone = "blue",
}: {
  title: string;
  value: number;
  tone?: "blue" | "emerald" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "red"
        ? "bg-red-50 text-red-700"
        : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>

      <span
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black ${toneClass}`}
      >
        Users
      </span>
    </div>
  );
}

function RuleBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "MAIN_ADMIN";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black ${
        isAdmin ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      {formatRole(role)}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatRole(role: string) {
  if (role === "MAIN_ADMIN") return "Main Admin";
  if (role === "STAFF") return "Staff";
  return role;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}