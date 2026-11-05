/**
 * Post status workflow transitions state machine.
 * 
 * Rules:
 * - draft -> published
 * - draft -> scheduled
 * - draft -> archived
 * - draft -> trash
 * - scheduled -> draft
 * - scheduled -> published
 * - scheduled -> trash
 * - published -> draft (unpublish)
 * - published -> archived
 * - published -> trash
 * - archived -> draft
 * - archived -> trash
 * - trash -> draft (restore)
 * 
 * Any other transition is illegal and throws an error.
 */

export type PostStatus = "draft" | "scheduled" | "published" | "archived" | "trash";

const ALLOWED_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ["published", "scheduled", "archived", "trash"],
  scheduled: ["draft", "published", "trash"],
  published: ["draft", "archived", "trash"],
  archived: ["draft", "trash"],
  trash: ["draft"],
};

export function isValidTransition(from: PostStatus, to: PostStatus): boolean {
  if (from === to) return true;
  const allowed = ALLOWED_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

export class TransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransitionError";
  }
}

export function assertValidTransition(from: PostStatus, to: PostStatus): void {
  if (!isValidTransition(from, to)) {
    throw new TransitionError(`Illegal post status transition from "${from}" to "${to}".`);
  }
}
