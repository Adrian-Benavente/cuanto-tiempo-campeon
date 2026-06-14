import { formatDurationText } from "./formatDuration";

describe("formatDuration", () => {
  test("formats simple drought in Spanish", () => {
    expect(
      formatDurationText({ years: 75, months: 2, days: 5 }, false, "es")
    ).toBe("75 años, 2 meses y 5 días");
  });

  test("formats simple drought in English", () => {
    expect(
      formatDurationText({ years: 3, months: 1, days: 0 }, false, "en")
    ).toBe("3 years and 1 month");
  });

  test("returns plain string for translation interpolation", () => {
    const text = formatDurationText({ years: 75, months: 0, days: 0 }, false, "es");

    expect(typeof text).toBe("string");
    expect(text).not.toContain("[object Object]");
  });
});
