import { describe, it, expect } from "vitest";
import { buildExportFilename } from "@/lib/sharing/export-utils";

describe("buildExportFilename", () => {
  it('returns "ttc-proposal.png" for empty string', () => {
    expect(buildExportFilename("")).toBe("ttc-proposal.png");
  });

  it('returns "ttc-proposal.png" for "Untitled Proposal"', () => {
    expect(buildExportFilename("Untitled Proposal")).toBe("ttc-proposal.png");
  });

  it('returns "my-cool-proposal.png" for "My Cool Proposal"', () => {
    expect(buildExportFilename("My Cool Proposal")).toBe("my-cool-proposal.png");
  });

  it('returns "ttc-extension-2.png" for "TTC Extension #2!"', () => {
    expect(buildExportFilename("TTC Extension #2!")).toBe("ttc-extension-2.png");
  });

  it('returns "spaces.png" for "  Spaces  "', () => {
    expect(buildExportFilename("  Spaces  ")).toBe("spaces.png");
  });

  it("lowercases all characters", () => {
    expect(buildExportFilename("ALL CAPS")).toBe("all-caps.png");
  });

  it("replaces multiple spaces with a single hyphen", () => {
    expect(buildExportFilename("A  B   C")).toBe("a-b-c.png");
  });

  it("strips special characters that are not alphanumeric or hyphens", () => {
    expect(buildExportFilename("Line & Station!")).toBe("line-station.png");
  });

  it("appends .png extension", () => {
    const result = buildExportFilename("My Proposal");
    expect(result.endsWith(".png")).toBe(true);
  });

  it('returns "ttc-proposal.png" for whitespace-only string', () => {
    expect(buildExportFilename("   ")).toBe("ttc-proposal.png");
  });
});
