import { describe, expect, it } from "vitest";
import { mapValuationCaseToMode, buildProjectLabel } from "./projects";

describe("mapValuationCaseToMode", () => {
  it("maps NPV Only to npv", () => {
    expect(mapValuationCaseToMode("NPV Only", "Delay")).toBe("npv");
  });

  it("maps Classic NPV to npv", () => {
    expect(
      mapValuationCaseToMode("Real Options Valuation", "Classic NPV"),
    ).toBe("npv");
  });

  it("maps Delay/Expand/Abandon", () => {
    expect(mapValuationCaseToMode("Real Options Valuation", "Delay")).toBe(
      "delay",
    );
    expect(mapValuationCaseToMode("Real Options Valuation", "Expand")).toBe(
      "expand",
    );
    expect(mapValuationCaseToMode("Real Options Valuation", "Abandon")).toBe(
      "abandon",
    );
  });
});

describe("buildProjectLabel", () => {
  it("builds PPT-style labels", () => {
    expect(buildProjectLabel("AI in wearables", "delay")).toBe(
      "AI in wearables – Option to Delay",
    );
    expect(buildProjectLabel("Product improvement", "npv")).toBe(
      "Product improvement – Classic NPV",
    );
  });
});
