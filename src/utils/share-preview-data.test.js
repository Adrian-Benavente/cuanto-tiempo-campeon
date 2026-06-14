const { getSharePreviewData } = require("../../api/_lib/share-preview-data");

describe("share-preview-data", () => {
  test("builds drought preview for Uruguay", () => {
    const preview = getSharePreviewData({ pais: "uruguay", lang: "es" });

    expect(preview.countryName).toBe("Uruguay");
    expect(preview.headline).toMatch(/Hace .* que Uruguay no gana el Mundial/);
    expect(preview.flagEmoji).toBe("🇺🇾");
  });

  test("builds never-won preview for Mexico", () => {
    const preview = getSharePreviewData({ pais: "mexico", lang: "es" });

    expect(preview.headline).toBe("México nunca fue campeón del mundo");
    expect(preview.ogType).toBe("neverWon");
  });

  test("builds current champion preview for Argentina", () => {
    const preview = getSharePreviewData({ pais: "argentina", lang: "es" });

    expect(preview.headline).toBe("Argentina es el último campeón mundial");
    expect(preview.ogType).toBe("currentChampion");
  });

  test("falls back to default preview without country", () => {
    const preview = getSharePreviewData({ lang: "en" });

    expect(preview.ogType).toBe("default");
    expect(preview.title).toMatch(/How long since you won the World Cup/i);
  });
});
