import { z } from "zod";
// Keep proxied uploads/downloads below the hosting function payload limit.
export const COMMUNITY_FILE_LIMIT = 4 * 1024 * 1024;
export const reactions = {
  like: "👍",
  love: "❤️",
  celebrate: "🎉",
  idea: "💡",
  question: "❓",
} as const;
export type Person = { user_id: string; name: string; instructor: boolean };
export type ChatFile = { id: string; name: string; size: number; mime: string };
export type ChatMessage = {
  id: number;
  user_id: string;
  author_name: string;
  instructor: boolean;
  body: string;
  deleted: boolean;
  created_at: string;
  edited_at: string | null;
  pinned: boolean;
  reply_to: number | null;
  reply?: { id: number; author_name: string; body: string };
  files: ChatFile[];
  reactions: { emoji: keyof typeof reactions; count: number; mine: boolean }[];
};
export type ChatChannel = {
  order_id?: string | null;
  id: string;
  name: string;
  description: string;
  private: boolean;
  announcements: boolean;
  locked: boolean;
  archived: boolean;
  unread?: number;
  mentions?: number;
};
export const mentionPattern = () => /@\[([^\]\n]{1,120})\]\(([a-f0-9-]{36})\)/g;
export function normalizeMentions(body: string, people: Person[]) {
  const ids = new Set<string>();
  const text = body.replace(
    mentionPattern(),
    (_match, _name: string, id: string) => {
      const person = people.find((p) => p.user_id === id);
      if (!person)
        throw new Error(
          "You can only tag current members of this conversation.",
        );
      ids.add(id);
      if (ids.size > 20) throw new Error("Tag up to 20 people in one message.");
      return `@[${person.name.replace(/[\[\]\r\n]/g, "").slice(0, 120)}](${id})`;
    },
  );
  if (text.length > 2000)
    throw new Error("Keep your message under 2,000 characters including tags.");
  return { body: text, ids: Array.from(ids) };
}
const base = { course: z.uuid(), channel: z.uuid() };
const message = {
  ...base,
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
};
export const communitySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("send"),
    ...base,
    body: z.string().trim().min(1).max(2000),
    client_id: z.uuid(),
    reply_to: z.number().int().positive().nullish(),
    files: z.array(z.uuid()).max(3).default([]),
  }),
  z.object({
    action: z.literal("edit"),
    ...message,
    body: z.string().trim().min(1).max(2000),
  }),
  z.object({ action: z.literal("delete"), ...message }),
  z.object({ action: z.literal("pin"), ...message, pinned: z.boolean() }),
  z.object({
    action: z.literal("react"),
    ...message,
    emoji: z.enum(["like", "love", "celebrate", "idea", "question"]),
    active: z.boolean(),
  }),
  z.object({ action: z.literal("read"), ...message }),
  z.object({
    action: z.literal("report"),
    ...message,
    reason: z.string().trim().min(5).max(500),
  }),
  z.object({ action: z.literal("discard_file"), ...base, file_id: z.uuid() }),
  z.object({ action: z.literal("resolve"), ...base, report_id: z.uuid() }),
  z.object({
    action: z.literal("create"),
    course: z.uuid(),
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500),
    private: z.boolean(),
    announcements: z.boolean().default(false),
    members: z.array(z.uuid()).max(200),
  }),
  z.object({
    action: z.literal("members"),
    ...base,
    members: z.array(z.uuid()).max(200),
  }),
  z.object({
    action: z.literal("settings"),
    ...base,
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500),
    announcements: z.boolean(),
    locked: z.boolean(),
    archived: z.boolean(),
  }),
]);
