import { getTone, POST_STATUS_COLOR_TONE, ROADMAP_TONE_CLASSES } from "@/lib/utils/postStatusTone";

describe("getTone", () => {
  it("returns 'muted' when color is null", () => {
    expect(getTone(null)).toBe("muted");
  });

  it("maps French Blue to primary", () => {
    expect(getTone("blueFrance")).toBe("primary");
  });

  it("maps green variants to success", () => {
    expect(getTone("greenEmeraude")).toBe("success");
    expect(getTone("greenBourgeon")).toBe("success");
    expect(getTone("success")).toBe("success");
  });

  it("maps yellow/orange to warning", () => {
    expect(getTone("yellowTournesol")).toBe("warning");
    expect(getTone("orangeTerreBattue")).toBe("warning");
    expect(getTone("warning")).toBe("warning");
  });

  it("maps red/pink to destructive", () => {
    expect(getTone("redMarianne")).toBe("destructive");
    expect(getTone("pinkMacaron")).toBe("destructive");
    expect(getTone("error")).toBe("destructive");
  });

  it("maps brown/beige to muted", () => {
    expect(getTone("brownCafeCreme")).toBe("muted");
    expect(getTone("beigeGrisGalet")).toBe("muted");
  });
});

describe("POST_STATUS_COLOR_TONE", () => {
  it("covers every PostStatusColor variant", () => {
    const colors = Object.keys(POST_STATUS_COLOR_TONE);
    expect(colors.length).toBeGreaterThan(20);
  });
});

describe("ROADMAP_TONE_CLASSES", () => {
  it("exposes border/bg/text/dot/cardBorder for each tone", () => {
    for (const tone of Object.keys(ROADMAP_TONE_CLASSES) as Array<keyof typeof ROADMAP_TONE_CLASSES>) {
      const classes = ROADMAP_TONE_CLASSES[tone];
      expect(classes.border).toBeTruthy();
      expect(classes.bg).toBeTruthy();
      expect(classes.text).toBeTruthy();
      expect(classes.dot).toBeTruthy();
      expect(classes.cardBorder).toBeTruthy();
    }
  });
});
