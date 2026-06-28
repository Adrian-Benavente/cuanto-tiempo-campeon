import {
  formatMatchDateTime,
  formatMatchKickoffTime,
} from "./formatMatchDateTime";

describe("formatMatchDateTime", () => {
  it("formats kickoffUtc in the requested time zone", () => {
    const match = {
      kickoffUtc: "2026-06-28T19:00:00.000Z",
      date: "2026-06-28",
      kickoff: "14:00",
    };

    const formatted = formatMatchDateTime(match, "es", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    expect(formatted?.dateTime).toBe("2026-06-28T19:00:00.000Z");
    expect(formatted?.label).toMatch(/4:00 p/);
  });

  it("prefers kickoffUtc over stadium date and kickoff fields", () => {
    const match = {
      kickoffUtc: "2026-06-28T19:00:00.000Z",
      date: "2026-06-28",
      kickoff: "14:00",
    };

    const formatted = formatMatchDateTime(match, "en", {
      timeZone: "UTC",
    });

    expect(formatted?.label).toMatch(/7:00/);
    expect(formatted?.label).not.toMatch(/2:00/);
  });

  it("falls back to date-only when kickoffUtc is missing", () => {
    const formatted = formatMatchDateTime(
      { date: "2026-06-28" },
      "es",
      { timeZone: "UTC" }
    );

    expect(formatted).toEqual({
      label: "28 jun",
      dateTime: "2026-06-28",
    });
  });
});

describe("formatMatchKickoffTime", () => {
  it("formats only the kickoff time from kickoffUtc", () => {
    const formatted = formatMatchKickoffTime(
      { kickoffUtc: "2026-06-28T19:00:00.000Z" },
      "en",
      { timeZone: "America/Argentina/Buenos_Aires" }
    );

    expect(formatted).toMatch(/4:00/);
  });
});
