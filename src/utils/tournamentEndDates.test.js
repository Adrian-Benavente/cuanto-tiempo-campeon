const {
  getKnownTournamentEndDate,
  resolveTournamentEndDate,
} = require("../../api/_lib/tournament-end-dates");

describe("tournament end dates", () => {
  it("returns known final dates without calling Zafronix", async () => {
    const zafronixFetch = jest.fn();

    await expect(
      resolveTournamentEndDate(2022, "test-key", zafronixFetch)
    ).resolves.toBe("2022-12-18T18:00:00.000Z");

    expect(zafronixFetch).not.toHaveBeenCalled();
    expect(getKnownTournamentEndDate(2018)).toBe("2018-07-15T18:00:00.000Z");
  });

  it("falls back to Zafronix for unknown years", async () => {
    const zafronixFetch = jest.fn().mockResolvedValue({
      tournament: { datesIso: { end: "2099-12-31" } },
    });

    await expect(
      resolveTournamentEndDate(2099, "test-key", zafronixFetch)
    ).resolves.toBe("2099-12-31T18:00:00.000Z");

    expect(zafronixFetch).toHaveBeenCalledWith(
      "/tournaments/2099",
      "test-key"
    );
  });
});
