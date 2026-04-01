import { describe, it, expect } from "vitest";
import {
  createInitialProposalDraft,
  proposalEditorReducer,
} from "../lib/proposal/proposal-state";
import type { EditorShellState } from "../lib/proposal/proposal-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stateWithTwoLinesAndOneStation(): EditorShellState {
  let state = createInitialProposalDraft();

  // Line A already exists with one station
  state = proposalEditorReducer(state, {
    type: "addLine",
    payload: { id: "line-a", name: "Line A", mode: "subway", color: "#7B61FF" },
  });

  // Place a station on Line A (proposal station — UUID-like id)
  state = proposalEditorReducer(state, {
    type: "placeStation",
    payload: {
      id: "station-shared",
      position: [-79.38, 43.65],
      lineId: "line-a",
      name: "Shared Station",
    },
  });

  // Line B exists but has no stations yet
  state = proposalEditorReducer(state, {
    type: "addLine",
    payload: { id: "line-b", name: "Line B", mode: "lrt", color: "#E91E8C" },
  });

  return state;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("confirmInterchange — proposal station merge path", () => {
  it("does not create a new station when nearbyStationId matches an existing proposal station", () => {
    let state = stateWithTwoLinesAndOneStation();
    const stationCountBefore = state.draft.stations.length;

    // Suggest interchange pointing at the existing proposal station
    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.38, 43.65],
        nearbyStationId: "station-shared",
        nearbyStationName: "Shared Station",
        lineId: "line-b",
        stationName: "Shared Station",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    expect(state.draft.stations.length).toBe(stationCountBefore);
  });

  it("adds suggestion.lineId to the existing station's lineIds", () => {
    let state = stateWithTwoLinesAndOneStation();

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.38, 43.65],
        nearbyStationId: "station-shared",
        nearbyStationName: "Shared Station",
        lineId: "line-b",
        stationName: "Shared Station",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    const shared = state.draft.stations.find((s) => s.id === "station-shared");
    expect(shared).toBeDefined();
    expect(shared!.lineIds).toContain("line-a");
    expect(shared!.lineIds).toContain("line-b");
    expect(shared!.lineIds.length).toBe(2);
  });

  it("adds the shared station ID to the new line's stationIds", () => {
    let state = stateWithTwoLinesAndOneStation();

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.38, 43.65],
        nearbyStationId: "station-shared",
        nearbyStationName: "Shared Station",
        lineId: "line-b",
        stationName: "Shared Station",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    const lineB = state.draft.lines.find((l) => l.id === "line-b");
    expect(lineB).toBeDefined();
    expect(lineB!.stationIds).toContain("station-shared");
  });

  it("both lines contain the shared station ID in their stationIds after merge", () => {
    let state = stateWithTwoLinesAndOneStation();

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.38, 43.65],
        nearbyStationId: "station-shared",
        nearbyStationName: "Shared Station",
        lineId: "line-b",
        stationName: "Shared Station",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    const lineA = state.draft.lines.find((l) => l.id === "line-a");
    const lineB = state.draft.lines.find((l) => l.id === "line-b");
    expect(lineA!.stationIds).toContain("station-shared");
    expect(lineB!.stationIds).toContain("station-shared");
  });

  it("clears pendingInterchangeSuggestion after merge", () => {
    let state = stateWithTwoLinesAndOneStation();

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.38, 43.65],
        nearbyStationId: "station-shared",
        nearbyStationName: "Shared Station",
        lineId: "line-b",
        stationName: "Shared Station",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    expect(state.chrome.pendingInterchangeSuggestion).toBeNull();
  });
});

describe("confirmInterchange — TTC baseline station path (unchanged behavior)", () => {
  it("creates a new proposal station when nearbyStationId is not in draft.stations", () => {
    let state = stateWithTwoLinesAndOneStation();
    const stationCountBefore = state.draft.stations.length;

    // TTC baseline station ID (simulated numeric ArcGIS OBJECTID)
    const ttcStationId = "12345";

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.39, 43.66],
        nearbyStationId: ttcStationId,
        nearbyStationName: "Bloor-Yonge",
        lineId: "line-b",
        stationName: "Bloor-Yonge Interchange",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    expect(state.draft.stations.length).toBe(stationCountBefore + 1);
  });

  it("sets linkedBaselineStationId on the new station when linking to TTC baseline", () => {
    let state = stateWithTwoLinesAndOneStation();
    const ttcStationId = "12345";

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.39, 43.66],
        nearbyStationId: ttcStationId,
        nearbyStationName: "Bloor-Yonge",
        lineId: "line-b",
        stationName: "Bloor-Yonge Interchange",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    const newStation = state.draft.stations[state.draft.stations.length - 1];
    expect(newStation.linkedBaselineStationId).toBe(ttcStationId);
    expect(newStation.lineIds).toEqual(["line-b"]);
  });

  it("adds the new station ID to the line's stationIds in TTC baseline path", () => {
    let state = stateWithTwoLinesAndOneStation();
    const ttcStationId = "12345";

    state = proposalEditorReducer(state, {
      type: "suggestInterchange",
      payload: {
        newStationPosition: [-79.39, 43.66],
        nearbyStationId: ttcStationId,
        nearbyStationName: "Bloor-Yonge",
        lineId: "line-b",
        stationName: "Bloor-Yonge Interchange",
      },
    });

    state = proposalEditorReducer(state, { type: "confirmInterchange" });

    const lineB = state.draft.lines.find((l) => l.id === "line-b");
    const newStation = state.draft.stations[state.draft.stations.length - 1];
    expect(lineB!.stationIds).toContain(newStation.id);
  });
});
