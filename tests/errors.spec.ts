import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../src/utils/errors";

describe("error helper", () => {
  it("returns fallback for unknown errors", () => {
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
  });

  it("returns Error.message when present", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });
});
