import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  user: {
    fullName: string;
    serviceNumber: string;
    role: "MAIN_ADMIN" | "STAFF";
    region: string | null;
  };
};

export default function AppShell({
  children,
  title,
  subtitle,
  user,
}: AppShellProps) {
  const showUsers = user.role === "MAIN_ADMIN";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="h-full overflow-y-auto p-4">
          {/* Small Logo Header */}
          <div className="mb-5 flex items-center gap-3 rounded-[1.5rem] bg-slate-900 p-4 text-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-base font-black">
              RT
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black">
                Regional Task Log
              </h1>
              <p className="truncate text-xs font-semibold text-slate-300">
                Internal work system
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <SideNavItem href="/dashboard" label="Dashboard" icon="⌂" />

            <div className="rounded-[1.5rem] bg-slate-50 p-2">
              <div className="flex items-center gap-3 px-3 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-blue-700">
                  ▣
                </span>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Task Manager
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Add, records, reports
                  </p>
                </div>
              </div>

              <div className="mt-1 space-y-1 pl-12">
                <SubNavItem href="/tasks/new" label="Add Task" />
                <SubNavItem href="/tasks" label="Task Records" />
                <SubNavItem href="/reports" label="Reports" />
              </div>
            </div>

            {showUsers && (
              <>
                <SideNavItem href="/users" label="Users" icon="👤" />
                <SideNavItem href="/settings" label="Settings" icon="⚙" />
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <section className="min-h-screen pb-24 lg:ml-72 lg:pb-8">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-600/20">
                RT
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-black text-slate-900">
                  {title}
                </h1>

                <p className="truncate text-xs font-semibold text-slate-500">
                  {user.fullName} •{" "}
                  {user.role === "MAIN_ADMIN" ? "All Regions" : user.region}
                </p>
              </div>
            </div>

            <form action="/api/auth/logout" method="post">
              <button className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white">
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Desktop Page Header */}
        <header className="hidden border-b border-slate-200 bg-white lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>

            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-right hover:bg-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {user.serviceNumber} •{" "}
                    {user.role === "MAIN_ADMIN" ? "All Regions" : user.region}
                  </p>
                </div>

                <span className="text-xs font-black text-slate-400">⌄</span>
              </summary>

              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-xl">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Account
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {user.role === "MAIN_ADMIN" ? "Main Admin" : "Staff"}
                  </p>
                </div>

                <form action="/api/auth/logout" method="post" className="mt-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100">
                    <span>⏻</span>
                    <span>Logout</span>
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>

        {children}
      </section>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div
          className={`grid gap-2 ${showUsers ? "grid-cols-5" : "grid-cols-4"}`}
        >
          <MobileNavItem href="/dashboard" label="Home" icon="⌂" />
          <MobileNavItem href="/tasks/new" label="Add" icon="+" />
          <MobileNavItem href="/tasks" label="Records" icon="⌕" />
          <MobileNavItem href="/reports" label="Reports" icon="▣" />

          {showUsers && (
  <MobileNavItem href="/settings" label="Settings" icon="⚙" />
)}
        </div>
      </nav>
    </main>
  );
}

function SideNavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function SubNavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-sm font-black text-slate-500 hover:bg-white hover:text-blue-700"
    >
      {label}
    </Link>
  );
}

function MobileNavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-slate-600 hover:bg-slate-100"
    >
      <span className="text-base font-black leading-none">{icon}</span>
      <span className="mt-1 text-[10px] font-black">{label}</span>
    </Link>
  );
}