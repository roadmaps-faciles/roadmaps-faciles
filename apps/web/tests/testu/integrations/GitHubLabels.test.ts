vi.mock("server-only", () => ({}));

import {
  MANAGED_LABEL,
  buildBoardLabel,
  buildStatusLabel,
  isManagedLabel,
  isRoadmapsFacilesLabel,
  parseBoardLabel,
  parseStatusLabel,
} from "@/lib/ee/integration-provider/impl/github/GitHubLabels";

describe("buildStatusLabel", () => {
  it("builds a prefixed status label", () => {
    expect(buildStatusLabel("en-cours")).toBe("roadmaps-faciles:status:en-cours");
  });

  it("preserves the status name as-is", () => {
    expect(buildStatusLabel("À Faire")).toBe("roadmaps-faciles:status:À Faire");
  });
});

describe("buildBoardLabel", () => {
  it("builds a prefixed board label", () => {
    expect(buildBoardLabel("mobile")).toBe("roadmaps-faciles:board:mobile");
  });
});

describe("parseStatusLabel", () => {
  it("extracts the status name from a valid label", () => {
    expect(parseStatusLabel("roadmaps-faciles:status:en-cours")).toBe("en-cours");
  });

  it("returns undefined for a non-status label", () => {
    expect(parseStatusLabel("bug")).toBeUndefined();
  });

  it("returns undefined for a board label", () => {
    expect(parseStatusLabel("roadmaps-faciles:board:mobile")).toBeUndefined();
  });

  it("handles status names containing colons", () => {
    expect(parseStatusLabel("roadmaps-faciles:status:a:b")).toBe("a:b");
  });
});

describe("parseBoardLabel", () => {
  it("extracts the board name from a valid label", () => {
    expect(parseBoardLabel("roadmaps-faciles:board:mobile")).toBe("mobile");
  });

  it("returns undefined for a non-board label", () => {
    expect(parseBoardLabel("enhancement")).toBeUndefined();
  });

  it("returns undefined for a status label", () => {
    expect(parseBoardLabel("roadmaps-faciles:status:en-cours")).toBeUndefined();
  });
});

describe("isManagedLabel", () => {
  it("returns true for the managed label", () => {
    expect(isManagedLabel(MANAGED_LABEL)).toBe(true);
    expect(isManagedLabel("roadmaps-faciles:managed")).toBe(true);
  });

  it("returns false for other labels", () => {
    expect(isManagedLabel("bug")).toBe(false);
    expect(isManagedLabel("roadmaps-faciles:status:x")).toBe(false);
  });
});

describe("isRoadmapsFacilesLabel", () => {
  it("returns true for any label with the roadmaps-faciles prefix", () => {
    expect(isRoadmapsFacilesLabel("roadmaps-faciles:status:x")).toBe(true);
    expect(isRoadmapsFacilesLabel("roadmaps-faciles:board:y")).toBe(true);
    expect(isRoadmapsFacilesLabel("roadmaps-faciles:managed")).toBe(true);
  });

  it("returns false for unrelated labels", () => {
    expect(isRoadmapsFacilesLabel("bug")).toBe(false);
    expect(isRoadmapsFacilesLabel("enhancement")).toBe(false);
    expect(isRoadmapsFacilesLabel("")).toBe(false);
  });
});
