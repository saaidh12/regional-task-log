"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  fullName: string;
  serviceNumber: string;
  region: string | null;
};

type ParticipantItem = {
  userId?: string;
  displayName: string;
  serviceNo?: string;
  region?: string;
};

type AssignedTaskItem = {
  assignedToUserId?: string;
  assignedToName: string;
  assignedToServiceNo?: string;
  assignedToRegion?: string;
  taskDetails: string;
  isCompleted?: boolean;
};

export default function AddYaumiyyaForm({
  userRole,
  userRegion,
  users,
}: {
  userRole: "MAIN_ADMIN" | "STAFF";
  userRegion: string | null;
  users: UserItem[];
}) {
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [finishedTime, setFinishedTime] = useState("");
  const [region] = useState(userRegion || "NPR");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");

  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [manualParticipant, setManualParticipant] = useState("");

  const [assignedTaskUserId, setAssignedTaskUserId] = useState("");
  const [assignedTaskDetails, setAssignedTaskDetails] = useState("");
  const [assignedTaskItems, setAssignedTaskItems] = useState<AssignedTaskItem[]>(
    []
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleUsers = useMemo(() => {
    if (userRole === "MAIN_ADMIN") {
      return users;
    }

    return users.filter((user) => user.region === userRegion);
  }, [users, userRole, userRegion]);

  function addUserParticipant(userId: string) {
    const user = users.find((item) => item.id === userId);

    if (!user) return;

    if (participants.some((item) => item.userId === user.id)) return;

    setParticipants([
      ...participants,
      {
        userId: user.id,
        displayName: user.fullName,
        serviceNo: user.serviceNumber,
        region: user.region || undefined,
      },
    ]);
  }

  function addManualParticipant() {
    const clean = manualParticipant.trim();

    if (!clean) return;

    setParticipants([
      ...participants,
      {
        displayName: clean,
      },
    ]);

    setManualParticipant("");
  }

  function removeParticipant(index: number) {
    setParticipants(participants.filter((_, i) => i !== index));
  }

  function addAssignedTask() {
    const user = users.find((item) => item.id === assignedTaskUserId);
    const details = assignedTaskDetails.trim();

    if (!user) {
      setError("Please select a user to assign the task.");
      return;
    }

    if (!details) {
      setError("Please write assigned task details.");
      return;
    }

    setError("");

    setAssignedTaskItems([
      ...assignedTaskItems,
      {
        assignedToUserId: user.id,
        assignedToName: user.fullName,
        assignedToServiceNo: user.serviceNumber,
        assignedToRegion: user.region || undefined,
        taskDetails: details,
        isCompleted: false,
      },
    ]);

    setAssignedTaskUserId("");
    setAssignedTaskDetails("");
  }

  function removeAssignedTask(index: number) {
    setAssignedTaskItems(assignedTaskItems.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/yaumiyya", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          startTime,
          finishedTime,
          region,
          meetingTitle,
          meetingNotes,
          participants,
          assignedTaskItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save Yaumiyya.");
        return;
      }

      setSuccess("Yaumiyya saved successfully.");

      setStartTime("");
      setFinishedTime("");
      setMeetingTitle("");
      setMeetingNotes("");
      setParticipants([]);
      setManualParticipant("");
      setAssignedTaskUserId("");
      setAssignedTaskDetails("");
      setAssignedTaskItems([]);

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
              Meeting Notes
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Add Yaumiyya
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              Update meeting participants, notes and assigned tasks in Dhivehi.
            </p>
          </div>
        </div>

        <SectionCard
          number="01"
          title="Meeting Details"
          subtitle="Add date, start time, finished time and title."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Start Time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Finished Time">
              <input
                type="time"
                value={finishedTime}
                onChange={(e) => setFinishedTime(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Title">
              <input
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Meeting title"
                className="input"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          number="02"
          title="Participants"
          subtitle="Select staff/users or add manual participant names."
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr]">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addUserParticipant(e.target.value);
                  e.currentTarget.value = "";
                }
              }}
              className="input"
              defaultValue=""
            >
              <option value="">Select user participant</option>
              {visibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} - {user.serviceNumber}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                value={manualParticipant}
                onChange={(e) => setManualParticipant(e.target.value)}
                placeholder="Manual name"
                className="input flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addManualParticipant();
                  }
                }}
              />

              <button
                type="button"
                onClick={addManualParticipant}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {participants.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-black text-amber-700">
              No participants added yet.
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {participants.map((participant, index) => (
                <button
                  type="button"
                  key={`${participant.displayName}-${index}`}
                  onClick={() => removeParticipant(index)}
                  className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-red-50 hover:text-red-700"
                >
                  {participant.displayName}
                  {participant.serviceNo ? ` (${participant.serviceNo})` : ""} ×
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          number="03"
          title="Meeting Notes"
          subtitle="Write meeting notes in Dhivehi."
        >
          <textarea
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            rows={8}
            dir="auto"
            placeholder="މީޓިންގ ނޯޓް..."
            className="input dhivehi-text resize-none text-lg leading-9"
          />
        </SectionCard>

        <SectionCard
          number="04"
          title="Assigned Tasks"
          subtitle="Tag actual users and assign follow-up tasks."
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr_auto]">
            <select
              value={assignedTaskUserId}
              onChange={(e) => setAssignedTaskUserId(e.target.value)}
              className="input"
            >
              <option value="">Select assigned user</option>
              {visibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} - {user.serviceNumber}
                </option>
              ))}
            </select>

            <textarea
              value={assignedTaskDetails}
              onChange={(e) => setAssignedTaskDetails(e.target.value)}
              rows={2}
              dir="auto"
              placeholder="އަސައިން ކުރެވުނު ޓާސްކް..."
              className="input dhivehi-text resize-none text-base leading-8"
            />

            <button
              type="button"
              onClick={addAssignedTask}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>

          {assignedTaskItems.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-black text-amber-700">
              No assigned tasks added yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {assignedTaskItems.map((task, index) => (
                <div
                  key={`${task.assignedToName}-${index}`}
                  className="rounded-[1.5rem] bg-blue-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-blue-500">
                        Assigned To
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {task.assignedToName}
                        {task.assignedToServiceNo
                          ? ` (${task.assignedToServiceNo})`
                          : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAssignedTask(index)}
                      className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="dhivehi-text mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-800 [overflow-wrap:anywhere]">
                    {task.taskDetails}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            {success}
          </div>
        )}

        <div className="sticky bottom-20 z-20 rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/yaumiyya")}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Yaumiyya"}
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Summary</h3>

          <div className="mt-4 space-y-3">
            <Info label="Date" value={date || "-"} />
            <Info label="Start Time" value={startTime || "-"} />
            <Info label="Finished Time" value={finishedTime || "-"} />
            <Info label="Participants" value={String(participants.length)} />
            <Info label="Assigned Tasks" value={String(assignedTaskItems.length)} />
            <Info label="Title" value={meetingTitle || "-"} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-900">
          Yaumiyya assigned tasks can now be tagged to actual user accounts.
        </div>
      </aside>
    </div>
  );
}

function SectionCard({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
          {number}
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}