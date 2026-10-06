import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "./time";

describe("formatRelativeTime", () => {
  it("returns seconds for very recent times", () => {
    const now = new Date();
    now.setSeconds(now.getSeconds() - 30);
    expect(formatRelativeTime(now.toISOString())).toMatch(/^\d+s$/);
  });

  it("returns minutes for recent times", () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 5);
    expect(formatRelativeTime(d.toISOString())).toBe("5m");
  });

  it("returns hours", () => {
    const d = new Date();
    d.setHours(d.getHours() - 3);
    expect(formatRelativeTime(d.toISOString())).toBe("3h");
  });

  it("returns 'Yesterday' for yesterday", () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(formatRelativeTime(d.toISOString())).toBe("Yesterday");
  });
});