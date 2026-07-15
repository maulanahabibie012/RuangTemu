import { describe, expect, it } from "vitest";
import { CATEGORIES, DEMO_EVENTS } from "./demo-events";

describe("DEMO_EVENTS", () => {
  it("has at least one demo event", () => {
    expect(DEMO_EVENTS.length).toBeGreaterThan(0);
  });

  it("each event has required fields", () => {
    for (const event of DEMO_EVENTS) {
      expect(event.id).toBeTruthy();
      expect(event.title).toBeTruthy();
      expect(event.category).toBeTruthy();
      expect(event.location).toBeTruthy();
      expect(event.dateLabel).toBeTruthy();
      expect(event.quotaLabel).toBeTruthy();
      expect(event.priceLabel).toBeTruthy();
      expect(typeof event.isFree).toBe("boolean");
      expect(event.coverGradient).toContain("from-");
    }
  });

  it("uses unique event ids", () => {
    const ids = DEMO_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("isFree matches priceLabel for free events", () => {
    for (const event of DEMO_EVENTS) {
      if (event.isFree) {
        expect(event.priceLabel.toLowerCase()).toContain("gratis");
      }
    }
  });
});

describe("CATEGORIES", () => {
  it("starts with Semua", () => {
    expect(CATEGORIES[0]).toBe("Semua");
  });

  it("includes categories used by demo events", () => {
    const used = new Set(DEMO_EVENTS.map((e) => e.category));
    for (const category of used) {
      expect(CATEGORIES).toContain(category);
    }
  });
});
