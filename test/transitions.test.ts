import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  assertValidTransition,
  TransitionError,
  PostStatus,
} from "../src/server/owner/posts/transitions";

describe("Post Status Transition Engine", () => {
  const validTransitions: [PostStatus, PostStatus][] = [
    ["draft", "published"],
    ["draft", "scheduled"],
    ["scheduled", "draft"],
    ["scheduled", "published"],
    ["published", "draft"],
    ["published", "archived"],
    ["archived", "draft"],
    ["draft", "trash"],
    ["published", "trash"],
    ["scheduled", "trash"],
    ["archived", "trash"],
    ["trash", "draft"],
  ];

  it("permits all explicitly allowed transitions", () => {
    for (const [from, to] of validTransitions) {
      expect(isValidTransition(from, to)).toBe(true);
      expect(() => assertValidTransition(from, to)).not.toThrow();
    }
  });

  const illegalTransitions: [PostStatus, PostStatus][] = [
    ["trash", "published"], // Trash can only be restored to draft
    ["trash", "scheduled"],
    ["trash", "archived"],
    ["archived", "published"], // Must be edited as draft first
    ["archived", "scheduled"],
    ["scheduled", "archived"],
  ];

  it("strictly rejects illegal transitions with TransitionError", () => {
    for (const [from, to] of illegalTransitions) {
      expect(isValidTransition(from, to)).toBe(false);
      expect(() => assertValidTransition(from, to)).toThrow(TransitionError);
    }
  });
});
