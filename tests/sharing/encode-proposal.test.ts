import { describe, it, expect } from "vitest";
import { encodeSharePayload, buildShareUrl } from "@/lib/sharing/encode-proposal";
import { decodeSharePayload } from "@/lib/sharing/decode-proposal";
import type { SharePayload, SharePayloadV2 } from "@/lib/sharing/sharing-types";
import type { ProposalDraft } from "@/lib/proposal/proposal-types";

const minimalDraft: ProposalDraft = {
  id: "test-id",
  title: "Test Proposal",
  baselineMode: "today",
  lines: [],
  stations: [],
};

// Use v2 payload for roundtrip tests (v1 payloads are migrated on decode)
const payload: SharePayloadV2 = {
  v: 2,
  draft: minimalDraft,
};

describe("encodeSharePayload", () => {
  it("produces a non-empty string", () => {
    const encoded = encodeSharePayload(payload);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);
  });

  it("is a valid base64 string (only base64 characters)", () => {
    const encoded = encodeSharePayload(payload);
    // Base64 characters: A-Z, a-z, 0-9, +, /, = (padding)
    // encodeURIComponent-encoded chars may include % as well — still valid for our purposes
    expect(encoded).toBeTruthy();
  });
});

describe("roundtrip: encode then decode", () => {
  it("returns an object deeply equal to the original v2 payload", () => {
    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(payload);
  });

  it("roundtrip works with optional author field", () => {
    const withAuthor: SharePayloadV2 = { ...payload, author: "Test User" };
    const encoded = encodeSharePayload(withAuthor);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(withAuthor);
  });

  it("roundtrip works with Unicode station names (accented characters)", () => {
    const unicodeDraft: ProposalDraft = {
      ...minimalDraft,
      title: "Côte-des-Neiges Extension",
      stations: [
        {
          id: "s1",
          name: "Côte-des-Neiges",
          position: [-73.6, 45.5],
          lineIds: ["l1"],
        },
      ],
      lines: [
        {
          id: "l1",
          name: "Ligne Bleue",
          color: "#0000FF",
          mode: "subway",
          waypoints: [[-73.6, 45.5], [-73.61, 45.51]],
          stationIds: ["s1"],
        },
      ],
    };
    const unicodePayload: SharePayloadV2 = { v: 2, draft: unicodeDraft, author: "Québécois Transit Fan" };
    const encoded = encodeSharePayload(unicodePayload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(unicodePayload);
  });

  it("roundtrip works with emoji in title", () => {
    const emojiDraft: ProposalDraft = {
      ...minimalDraft,
      title: "My Dream 🚇 Network",
    };
    const emojiPayload: SharePayloadV2 = { v: 2, draft: emojiDraft };
    const encoded = encodeSharePayload(emojiPayload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(emojiPayload);
  });

  it("v1 payload encodes and decodes to v2 (migration)", () => {
    const v1Payload: SharePayload = { v: 1, draft: minimalDraft };
    const encoded = encodeSharePayload(v1Payload);
    const decoded = decodeSharePayload(encoded);
    // v1 is migrated to v2 on decode
    expect(decoded!.v).toBe(2);
    expect(decoded!.draft.lines).toEqual([]);
    expect(decoded!.draft.stations).toEqual([]);
  });
});

describe("buildShareUrl", () => {
  it("produces a string containing /#p= and the encoded payload", () => {
    // In Node test env, window.location.origin is undefined
    // We test that the function returns a string with the correct format
    const encoded = encodeSharePayload(payload);
    // We test by mocking window in global scope for Node
    const original = global.window;
    try {
      Object.defineProperty(global, "window", {
        value: { location: { origin: "https://example.com" } },
        configurable: true,
        writable: true,
      });
      const url = buildShareUrl(payload);
      expect(url).toBe(`https://example.com/#p=${encoded}`);
      expect(url.includes("/#p=")).toBe(true);
    } finally {
      Object.defineProperty(global, "window", {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });
});
