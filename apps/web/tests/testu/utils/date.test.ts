import { formatDate, formatDateHour, formatRelativeDate } from "@/utils/date";

describe("formatDateHour", () => {
  const date = new Date("2024-06-15T14:30:00Z");

  it("formats with French locale", () => {
    const result = formatDateHour(date, "fr");
    expect(result).toContain("15/06/2024");
  });

  it("formats with English locale", () => {
    const result = formatDateHour(date, "en");
    expect(result).toMatch(/6\/15\/2?0?24/);
  });
});

describe("formatDate", () => {
  const date = new Date("2024-06-15T14:30:00Z");

  it("formats short date in French", () => {
    const result = formatDate(date, "fr");
    expect(result).toBe("15/06/2024");
  });

  it("formats short date in English", () => {
    const result = formatDate(date, "en");
    expect(result).toMatch(/6\/15\/2?0?24/);
  });

  it("formats full date in French", () => {
    const result = formatDate(date, "fr", true);
    expect(result).toContain("samedi");
    expect(result).toContain("juin");
    expect(result).toContain("2024");
  });

  it("formats full date in English", () => {
    const result = formatDate(date, "en", true);
    expect(result).toContain("Saturday");
    expect(result).toContain("June");
    expect(result).toContain("2024");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats seconds ago", () => {
    const date = new Date("2024-06-15T11:59:30Z");
    const result = formatRelativeDate(date, "fr");
    expect(result).toContain("30");
    expect(result).toContain("seconde");
  });

  it("formats minutes ago", () => {
    const date = new Date("2024-06-15T11:55:00Z");
    const result = formatRelativeDate(date, "fr");
    expect(result).toContain("5");
    expect(result).toContain("minute");
  });

  it("formats hours ago", () => {
    const date = new Date("2024-06-15T09:00:00Z");
    const result = formatRelativeDate(date, "fr");
    expect(result).toContain("3");
    expect(result).toContain("heure");
  });

  it("formats days ago", () => {
    const date = new Date("2024-06-12T12:00:00Z");
    const result = formatRelativeDate(date, "fr");
    expect(result).toContain("3");
    expect(result).toContain("jour");
  });

  it("formats months ago", () => {
    const date = new Date("2024-04-15T12:00:00Z");
    const result = formatRelativeDate(date, "fr");
    expect(result).toContain("2");
    expect(result).toContain("mois");
  });

  it("formats years ago", () => {
    const date = new Date("2022-06-15T12:00:00Z");
    const result = formatRelativeDate(date, "fr");
    expect(result).toContain("2");
    expect(result).toContain("an");
  });

  it("formats with English locale", () => {
    const date = new Date("2024-06-15T11:55:00Z");
    const result = formatRelativeDate(date, "en");
    expect(result).toContain("5");
    expect(result).toContain("minute");
  });
});
