import { describe, it, expect } from "vitest";
import { proposalEditorReducer, createInitialProposalDraft } from "@/lib/proposal/proposal-state";
import type { EditorShellState } from "@/lib/proposal/proposal-types";

// Helper: build a state with one line and one existing station on it
function makeStateWithOneLine(): EditorShellState {
  const base = createInitialProposalDraft();
  const s1 = {
    id: "existing-s1",
    name: "Existing Station",
    position: [-79.38, 43.65] as [number, number],
    lineIds: ["l1"],
  };
  const line = {
    id: "l1",
    name: "Line 1",
    color: "#7B61FF",
    mode: "subway" as const,
    waypoints: [s1.position],
    stationIds: ["existing-s1"],
  };
  return {
    ...base,
    draft: { ...base.draft, stations: [s1], lines: [line] },
  };
}

describe("placeStation — auto-interchange", () => {
  it("Test 5: placeStation with linkedBaselineStationId sets it on the new station", () => {
    const state = makeStateWithOneLine();
    const newStationId = "new-station-id";

    const next = proposalEditorReducer(state, {
      type: "placeStation",
      payload: {
        id: newStationId,
        position: [-79.39, 43.66],
        lineId: "l1",
        name: "Bloor-Yonge",
        linkedBaselineStationId: "ttc-baseline-42",
      },
    });

    const placed = next.draft.stations.find((s) => s.id === newStationId);
    expect(placed).toBeDefined();
    expect(placed?.linkedBaselineStationId).toBe("ttc-baseline-42");
    expect(placed?.name).toBe("Bloor-Yonge");
    expect(placed?.lineIds).toContain("l1");
  });

  it("Test 6: placeStation with mergeWithStationId adds lineId to existing station lineIds", () => {
    const base = createInitialProposalDraft();
    // Set up two lines; existing-s1 belongs to l1
    const s1 = {
      id: "existing-s1",
      name: "Bloor-Yonge",
      position: [-79.38, 43.65] as [number, number],
      lineIds: ["l1"],
    };
    const line1 = {
      id: "l1",
      name: "Line 1",
      color: "#7B61FF",
      mode: "subway" as const,
      waypoints: [s1.position],
      stationIds: ["existing-s1"],
    };
    const line2 = {
      id: "l2",
      name: "Line 2",
      color: "#E91E8C",
      mode: "subway" as const,
      waypoints: [],
      stationIds: [],
    };
    const state: EditorShellState = {
      ...base,
      draft: { ...base.draft, stations: [s1], lines: [line1, line2] },
    };

    // Placing a station on l2 near existing-s1 should merge, not create a new station
    const next = proposalEditorReducer(state, {
      type: "placeStation",
      payload: {
        id: "new-station-id-should-not-appear",
        position: [-79.38, 43.65],
        lineId: "l2",
        name: "Bloor-Yonge",
        mergeWithStationId: "existing-s1",
      },
    });

    // No new station should be created
    expect(next.draft.stations).toHaveLength(1);
    expect(next.draft.stations.find((s) => s.id === "new-station-id-should-not-appear")).toBeUndefined();

    // Existing station should have l2 in lineIds
    const merged = next.draft.stations.find((s) => s.id === "existing-s1");
    expect(merged?.lineIds).toContain("l1");
    expect(merged?.lineIds).toContain("l2");

    // Line l2 should have the existing station's id in stationIds
    const l2After = next.draft.lines.find((l) => l.id === "l2");
    expect(l2After?.stationIds).toContain("existing-s1");
  });
});
