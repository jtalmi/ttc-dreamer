import { describe, it, expect } from "vitest";
import { proposalEditorReducer, createInitialProposalDraft } from "@/lib/proposal/proposal-state";
import type { EditorShellState } from "@/lib/proposal/proposal-types";

// Helper: build an initial state with pre-seeded lines and stations
function makeStateWithTwoStationsOnLine(): EditorShellState {
  const base = createInitialProposalDraft();
  const s1 = { id: "s1", name: "Station 1", position: [-79.38, 43.65] as [number, number], lineIds: ["l1"] };
  const s2 = { id: "s2", name: "Station 2", position: [-79.40, 43.66] as [number, number], lineIds: ["l1"] };
  const line = {
    id: "l1",
    name: "Line 1",
    color: "#7B61FF",
    mode: "subway" as const,
    waypoints: [s1.position, s2.position],
    stationIds: ["s1", "s2"],
  };
  return {
    ...base,
    draft: {
      ...base.draft,
      stations: [s1, s2],
      lines: [line],
    },
  };
}

describe("moveStation reducer", () => {
  it("Test 1: updates the station position to new coordinates", () => {
    const state = makeStateWithTwoStationsOnLine();
    const newPos: [number, number] = [-79.42, 43.70];

    const next = proposalEditorReducer(state, {
      type: "moveStation",
      payload: { stationId: "s1", position: newPos },
    });

    const movedStation = next.draft.stations.find((s) => s.id === "s1");
    expect(movedStation?.position).toEqual(newPos);
  });

  it("Test 2: re-derives waypoints for each line containing the moved station", () => {
    const state = makeStateWithTwoStationsOnLine();
    const newPos: [number, number] = [-79.42, 43.70];

    const next = proposalEditorReducer(state, {
      type: "moveStation",
      payload: { stationId: "s1", position: newPos },
    });

    const line = next.draft.lines.find((l) => l.id === "l1");
    // waypoints[0] should now reflect the new position of s1
    expect(line?.waypoints[0]).toEqual(newPos);
    // waypoints[1] should still be s2's original position
    expect(line?.waypoints[1]).toEqual([-79.40, 43.66]);
  });

  it("Test 3: does NOT modify lines that do not reference the moved station", () => {
    const base = createInitialProposalDraft();
    const s1 = { id: "s1", name: "Station 1", position: [-79.38, 43.65] as [number, number], lineIds: ["l1"] };
    const s2 = { id: "s2", name: "Station 2", position: [-79.40, 43.66] as [number, number], lineIds: ["l1"] };
    const s3 = { id: "s3", name: "Station 3", position: [-79.35, 43.63] as [number, number], lineIds: ["l2"] };
    const s4 = { id: "s4", name: "Station 4", position: [-79.36, 43.64] as [number, number], lineIds: ["l2"] };
    const line1 = {
      id: "l1",
      name: "Line 1",
      color: "#7B61FF",
      mode: "subway" as const,
      waypoints: [s1.position, s2.position],
      stationIds: ["s1", "s2"],
    };
    const line2 = {
      id: "l2",
      name: "Line 2",
      color: "#E91E8C",
      mode: "lrt" as const,
      waypoints: [s3.position, s4.position],
      stationIds: ["s3", "s4"],
    };
    const state: EditorShellState = {
      ...base,
      draft: { ...base.draft, stations: [s1, s2, s3, s4], lines: [line1, line2] },
    };

    const next = proposalEditorReducer(state, {
      type: "moveStation",
      payload: { stationId: "s1", position: [-79.50, 43.70] },
    });

    // Line 2 does not include s1 — its waypoints should be unchanged
    const line2After = next.draft.lines.find((l) => l.id === "l2");
    expect(line2After?.waypoints).toEqual([s3.position, s4.position]);
  });

  it("Test 4: re-derives waypoints for ALL connected lines when a shared station is moved", () => {
    const base = createInitialProposalDraft();
    const s1 = { id: "s1", name: "Station 1", position: [-79.38, 43.65] as [number, number], lineIds: ["l1"] };
    // s2 is shared between l1 and l2
    const s2 = { id: "s2", name: "Interchange", position: [-79.40, 43.66] as [number, number], lineIds: ["l1", "l2"] };
    const s3 = { id: "s3", name: "Station 3", position: [-79.42, 43.67] as [number, number], lineIds: ["l2"] };
    const line1 = {
      id: "l1",
      name: "Line 1",
      color: "#7B61FF",
      mode: "subway" as const,
      waypoints: [s1.position, s2.position],
      stationIds: ["s1", "s2"],
    };
    const line2 = {
      id: "l2",
      name: "Line 2",
      color: "#E91E8C",
      mode: "subway" as const,
      waypoints: [s2.position, s3.position],
      stationIds: ["s2", "s3"],
    };
    const state: EditorShellState = {
      ...base,
      draft: { ...base.draft, stations: [s1, s2, s3], lines: [line1, line2] },
    };

    const newPos: [number, number] = [-79.45, 43.68];
    const next = proposalEditorReducer(state, {
      type: "moveStation",
      payload: { stationId: "s2", position: newPos },
    });

    const l1After = next.draft.lines.find((l) => l.id === "l1");
    const l2After = next.draft.lines.find((l) => l.id === "l2");

    // Both lines should have updated waypoints reflecting s2's new position
    expect(l1After?.waypoints[1]).toEqual(newPos);
    expect(l2After?.waypoints[0]).toEqual(newPos);
  });
});
