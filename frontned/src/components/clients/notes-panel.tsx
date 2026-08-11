"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { Note } from "@/lib/types";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, initials, timeAgo } from "@/lib/utils";

export function NotesPanel({
  notes,
  onAdd,
}: {
  notes: Note[];
  onAdd: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 border-b border-line px-5 py-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Log a call, an email, or an internal note…"
          rows={2}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={submitting} disabled={!content.trim()}>
            <Send className="h-3.5 w-3.5" />
            Add note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No activity yet"
          description="Notes and status changes will appear here as a timeline."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-3 px-5 py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-[10px] font-medium text-brand-ink">
                {initials(note.author.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] font-medium text-ink">{note.author.name}</p>
                  <span
                    className="shrink-0 font-mono text-[10.5px] text-ink-faint"
                    title={formatDateTime(note.createdAt)}
                  >
                    {timeAgo(note.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
                  {note.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
