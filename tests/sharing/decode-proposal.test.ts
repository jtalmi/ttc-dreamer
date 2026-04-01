import { describe, it, expect } from "vitest";
import { decodeSharePayload } from "@/lib/sharing/decode-proposal";
import { encodeSharePayload } from "@/lib/sharing/encode-proposal";
import type { SharePayload } from "@/lib/sharing/sharing-types";
import type { ProposalDraft } from "@/lib/proposal/proposal-types";

const minimalDraft: ProposalDraft = {
  id: "test-id",
  title: "Test Proposal",
  baselineMode: "today",
  lines: [],
  stations: [],
};

const validPayload: SharePayload = {
  v: 1,
  draft: minimalDraft,
};

describe("decodeSharePayload - null cases", () => {
  it("returns null for empty string", () => {
    expect(decodeSharePayload("")).toBeNull();
  });

  it("returns null for garbage/non-base64 string", () => {
    expect(decodeSharePayload("not-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 that is not JSON", () => {
    // base64 of "hello world" which is not JSON
    const encoded = btoa("hello world");
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when v field is missing", () => {
    const noV = { draft: minimalDraft };
    const encoded = btoa(encodeURIComponent(JSON.stringify(noV)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when v field is wrong version (v:2)", () => {
    const wrongV = { v: 2, draft: minimalDraft };
    const encoded = btoa(encodeURIComponent(JSON.stringify(wrongV)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when draft field is missing", () => {
    const noDraft = { v: 1 };
    const encoded = btoa(encodeURIComponent(JSON.stringify(noDraft)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when draft.lines is missing", () => {
    const noLines = { v: 1, draft: { id: "x", title: "T", baselineMode: "today", stations: [] } };
    const encoded = btoa(encodeURIComponent(JSON.stringify(noLines)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when draft.stations is missing", () => {
    const noStations = { v: 1, draft: { id: "x", title: "T", baselineMode: "today", lines: [] } };
    const encoded = btoa(encodeURIComponent(JSON.stringify(noStations)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when draft.lines is not an array", () => {
    const linesNotArray = { v: 1, draft: { id: "x", title: "T", baselineMode: "today", lines: "not-array", stations: [] } };
    const encoded = btoa(encodeURIComponent(JSON.stringify(linesNotArray)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when draft is null", () => {
    const nullDraft = { v: 1, draft: null };
    const encoded = btoa(encodeURIComponent(JSON.stringify(nullDraft)));
    expect(decodeSharePayload(encoded)).toBeNull();
  });
});

describe("decodeSharePayload - hash prefix handling", () => {
  it("decodes correctly when hash has #p= prefix", () => {
    const encoded = encodeSharePayload(validPayload);
    const withPrefix = `#p=${encoded}`;
    const decoded = decodeSharePayload(withPrefix);
    expect(decoded).toEqual(validPayload);
  });

  it("decodes correctly without #p= prefix", () => {
    const encoded = encodeSharePayload(validPayload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(validPayload);
  });
});

describe("decodeSharePayload - valid payloads", () => {
  it("returns the original payload for a valid encoded string", () => {
    const encoded = encodeSharePayload(validPayload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(validPayload);
  });

  it("preserves optional author field", () => {
    const withAuthor: SharePayload = { ...validPayload, author: "Jane Doe" };
    const encoded = encodeSharePayload(withAuthor);
    const decoded = decodeSharePayload(encoded);
    expect(decoded?.author).toBe("Jane Doe");
  });
});
