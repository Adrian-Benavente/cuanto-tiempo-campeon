const {
  clearZafronixCache,
  zafronixFetch,
} = require("../../api/_lib/zafronix-client");

describe("zafronixFetch", () => {
  beforeEach(() => {
    clearZafronixCache();
    global.fetch = jest.fn();
  });

  it("reuses cached body on 304 responses", async () => {
    global.fetch
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: {
          get: (name) => (name.toLowerCase() === "etag" ? '"abc123"' : null),
        },
        json: async () => ({ data: "fresh" }),
      })
      .mockResolvedValueOnce({
        status: 304,
        ok: false,
        headers: { get: () => null },
      });

    const first = await zafronixFetch("/tournaments", "test-key");
    const second = await zafronixFetch("/tournaments", "test-key");

    expect(first).toEqual({ data: "fresh" });
    expect(second).toEqual({ data: "fresh" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[1][1].headers["If-None-Match"]).toBe(
      '"abc123"'
    );
  });
});
