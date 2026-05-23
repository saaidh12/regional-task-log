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
  const showAdminLinks = user.role === "MAIN_ADMIN";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8ff]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-blue-100 bg-white/95 backdrop-blur lg:block">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-5 text-white shadow-xl shadow-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-black ring-1 ring-white/20">
                  RT
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-black">
                    Regional Task Log
                  </h1>
                  <p className="truncate text-xs font-bold text-blue-100">
                    Internal work system
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wide text-blue-100">
                    User
                  </p>
                  <p className="mt-1 truncate text-xs font-black">
                    {user.serviceNumber}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wide text-blue-100">
                    Region
                  </p>
                  <p className="mt-1 truncate text-xs font-black">
                    {user.role === "MAIN_ADMIN" ? "ALL" : user.region}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <SideNavItem
                href="/dashboard"
                label="Dashboard"
                icon={<HomeIcon />}
              />

              <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-2">
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <TaskIcon />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-blue-950">
                      Task Manager
                    </p>
                    <p className="truncate text-xs font-bold text-blue-500">
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

              <SideNavItem
                href="/information"
                label="Information"
                icon={<InfoIcon />}
              />

              <SideNavItem
                href="/yaumiyya"
                label="Yaumiyya"
                icon={<NotesIcon />}
              />

              <SideNavItem
                href="/database"
                label="Database"
                icon={<DatabaseIcon />}
              />

              <SideNavItem
                href="/support"
                label="Support"
                icon={<SupportIcon />}
              />

              {showAdminLinks && (
                <>
                  <SideNavItem href="/users" label="Users" icon={<UsersIcon />} />
                  <SideNavItem
                    href="/settings"
                    label="Settings"
                    icon={<SettingsIcon />}
                  />
                </>
              )}
            </nav>
          </div>
        </div>
      </aside>

      <section className="min-h-screen overflow-x-hidden pb-24 lg:ml-72 lg:w-[calc(100%-18rem)] lg:pb-8">
        <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3 px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 text-base font-black text-white shadow-lg shadow-blue-600/20">
                RT
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-black text-slate-950">
                  {title}
                </h1>

                <p className="truncate text-xs font-bold text-slate-500">
                  {user.fullName} •{" "}
                  {user.role === "MAIN_ADMIN" ? "All Regions" : user.region}
                </p>
              </div>
            </div>

            <form action="/api/auth/logout" method="post" className="shrink-0">
              <button className="shrink-0 rounded-2xl bg-blue-950 px-3 py-2 text-xs font-black text-white shadow-lg shadow-blue-950/20">
                Logout
              </button>
            </form>
          </div>
        </header>

        <header className="hidden border-b border-blue-100 bg-white/90 backdrop-blur-xl lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <h2 className="text-2xl font-black text-slate-950">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>

            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-right hover:bg-blue-100/70">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {user.fullName}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {user.serviceNumber} •{" "}
                    {user.role === "MAIN_ADMIN" ? "All Regions" : user.region}
                  </p>
                </div>

                <span className="text-xs font-black text-blue-600">⌄</span>
              </summary>

              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[1.5rem] border border-blue-100 bg-white p-3 shadow-xl shadow-blue-950/10">
                <div className="rounded-2xl bg-blue-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-blue-400">
                    Account
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {user.fullName}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {user.role === "MAIN_ADMIN" ? "Main Admin" : "Staff"}
                  </p>
                </div>

                <form action="/api/auth/logout" method="post" className="mt-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100">
                    <LogoutIcon />
                    <span>Logout</span>
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>

        {children}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-100 bg-white/95 px-2 pb-3 pt-2 shadow-2xl shadow-blue-950/10 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          <MobileNavItem href="/dashboard" label="Home" icon={<HomeIcon />} />
          <MobileNavItem href="/tasks" label="Tasks" icon={<TaskIcon />} />
          <MobileNavItem href="/information" label="Info" icon={<InfoIcon />} />
          <MobileNavItem
            href="/yaumiyya"
            label="Yaumiyya"
            icon={<NotesIcon />}
          />
          <MobileNavItem
            href="/database"
            label="DB"
            icon={<DatabaseIcon />}
          />
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
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl px-4 py-3 font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
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
      className="block rounded-xl px-3 py-2 text-sm font-black text-blue-700/70 transition hover:bg-white hover:text-blue-900"
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
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </span>
      <span className="mt-1 max-w-full truncate text-[10px] font-black leading-none">
        {label}
      </span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H7l-4 2 1.5-4A8.5 8.5 0 1 1 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8c.17.37.4.7.7 1 .3.3.63.53 1 .7H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-4-2-3 2-3-2-4 2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c5 0 9 1.8 9 4s-4 4-9 4-9-1.8-9-4 4-4 9-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3 7v5c0 2.2 4 4 9 4s9-1.8 9-4V7M3 12v5c0 2.2 4 4 9 4s9-1.8 9-4v-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10 17l5-5-5-5M15 12H3M21 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}