import { describe, it, expect } from "vitest";
import { decodeSharePayload } from "@/lib/sharing/decode-proposal";
import { encodeSharePayload } from "@/lib/sharing/encode-proposal";
import type { SharePayload, SharePayloadV2 } from "@/lib/sharing/sharing-types";
import type { ProposalDraft } from "@/lib/proposal/proposal-types";

const minimalDraft: ProposalDraft = {
  id: "test-id",
  title: "Test Proposal",
  baselineMode: "today",
  lines: [],
  stations: [],
};

const validV1Payload: SharePayload = {
  v: 1,
  draft: minimalDraft,
};

const validV2Payload: SharePayloadV2 = {
  v: 2,
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

  it("returns null when v field is wrong version (v:3)", () => {
    const wrongV = { v: 3, draft: minimalDraft };
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
    const encoded = encodeSharePayload(validV2Payload);
    const withPrefix = `#p=${encoded}`;
    const decoded = decodeSharePayload(withPrefix);
    expect(decoded).not.toBeNull();
    expect(decoded!.v).toBe(2);
  });

  it("decodes correctly without #p= prefix", () => {
    const encoded = encodeSharePayload(validV2Payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.v).toBe(2);
  });
});

describe("decodeSharePayload - v2 payloads", () => {
  it("returns the v2 payload as-is (no migration needed)", () => {
    const encoded = encodeSharePayload(validV2Payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.v).toBe(2);
    expect(decoded!.draft).toEqual(minimalDraft);
  });

  it("preserves optional author field for v2", () => {
    const withAuthor: SharePayloadV2 = { ...validV2Payload, author: "Jane Doe" };
    const encoded = encodeSharePayload(withAuthor);
    const decoded = decodeSharePayload(encoded);
    expect(decoded?.author).toBe("Jane Doe");
  });

  it("returns v2 for a v2 payload with lines and stations", () => {
    const draftWithData: ProposalDraft = {
      ...minimalDraft,
      lines: [
        {
          id: "l1",
          name: "Test Line",
          color: "#7B61FF",
          mode: "subway",
          waypoints: [[-79.38, 43.65], [-79.39, 43.66]],
          stationIds: ["s1", "s2"],
        },
      ],
      stations: [
        { id: "s1", name: "Station A", position: [-79.38, 43.65], lineIds: ["l1"] },
        { id: "s2", name: "Station B", position: [-79.39, 43.66], lineIds: ["l1"] },
      ],
    };
    const payload: SharePayloadV2 = { v: 2, draft: draftWithData };
    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded!.v).toBe(2);
    expect(decoded!.draft.lines[0].stationIds).toEqual(["s1", "s2"]);
  });
});

describe("decodeSharePayload - v1 migration to v2", () => {
  it("decodes a v1 payload and returns v2", () => {
    const encoded = encodeSharePayload(validV1Payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded!.v).toBe(2);
  });

  it("v1 payload with lines that have waypoints but no stationIds gets stations created", () => {
    const v1Draft: ProposalDraft = {
      ...minimalDraft,
      lines: [
        {
          id: "l1",
          name: "Test Line",
          color: "#7B61FF",
          mode: "subway",
          waypoints: [[-79.38, 43.65], [-79.39, 43.66], [-79.40, 43.67]],
          stationIds: [],
        },
      ],
      stations: [],
    };
    const v1Payload: SharePayload = { v: 1, draft: v1Draft };
    const encoded = encodeSharePayload(v1Payload);
    const decoded = decodeSharePayload(encoded);

    expect(decoded!.v).toBe(2);
    // 3 waypoints → 3 stations created
    expect(decoded!.draft.stations).toHaveLength(3);
    expect(decoded!.draft.lines[0].stationIds).toHaveLength(3);
  });

  it("v1 payload — migrated stations have positions matching original waypoints", () => {
    const waypoints: [number, number][] = [[-79.38, 43.65], [-79.39, 43.66]];
    const v1Draft: ProposalDraft = {
      ...minimalDraft,
      lines: [
        {
          id: "l1",
          name: "Test Line",
          color: "#7B61FF",
          mode: "subway",
          waypoints,
          stationIds: [],
        },
      ],
      stations: [],
    };
    const v1Payload: SharePayload = { v: 1, draft: v1Draft };
    const encoded = encodeSharePayload(v1Payload);
    const decoded = decodeSharePayload(encoded);

    const stationPositions = decoded!.draft.lines[0].stationIds.map(
      (id) => decoded!.draft.stations.find((s) => s.id === id)!.position,
    );
    expect(stationPositions[0]).toEqual([-79.38, 43.65]);
    expect(stationPositions[1]).toEqual([-79.39, 43.66]);
  });

  it("v1 payload — lines that already have stationIds are not re-migrated", () => {
    const v1Draft: ProposalDraft = {
      ...minimalDraft,
      lines: [
        {
          id: "l1",
          name: "Test Line",
          color: "#7B61FF",
          mode: "subway",
          waypoints: [[-79.38, 43.65], [-79.39, 43.66]],
          stationIds: ["existing-s1", "existing-s2"],
        },
      ],
      stations: [
        { id: "existing-s1", name: "S1", position: [-79.38, 43.65], lineIds: ["l1"] },
        { id: "existing-s2", name: "S2", position: [-79.39, 43.66], lineIds: ["l1"] },
      ],
    };
    const v1Payload: SharePayload = { v: 1, draft: v1Draft };
    const encoded = encodeSharePayload(v1Payload);
    const decoded = decodeSharePayload(encoded);

    // No new stations added — original 2 remain
    expect(decoded!.draft.stations).toHaveLength(2);
    expect(decoded!.draft.lines[0].stationIds).toEqual(["existing-s1", "existing-s2"]);
  });

  it("v1 payload preserves author after migration", () => {
    const v1Payload: SharePayload = { v: 1, draft: minimalDraft, author: "Transit Fan" };
    const encoded = encodeSharePayload(v1Payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded!.author).toBe("Transit Fan");
  });
});
