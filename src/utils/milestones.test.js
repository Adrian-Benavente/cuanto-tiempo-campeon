import { getActiveMilestone } from "./milestones";

describe("milestones", () => {
  test("detects approaching milestone", () => {
    const now = new Date("2024-09-24T00:00:00.000Z");
    const lastWin = new Date("2022-01-01T00:00:00.000Z");

    const milestone = getActiveMilestone(lastWin, now);

    expect(milestone?.type).toBe("approaching");
    expect(milestone?.milestone).toBe(1000);
  });

  test("detects reached milestone", () => {
    const now = new Date("2024-09-28T00:00:00.000Z");
    const lastWin = new Date("2022-01-01T00:00:00.000Z");

    const milestone = getActiveMilestone(lastWin, now);

    expect(milestone?.type).toBe("reached");
    expect(milestone?.milestone).toBe(1000);
  });
});
