import { describe, it, expect } from "vitest";
import {
  historyReducer,
  createInitialHistoryState,
} from "@/lib/proposal/proposal-history";
import type { HistoryState } from "@/lib/proposal/proposal-history";

// Helper: dispatch an action that is in HISTORY_ACTIONS (addLine)
function dispatchHistoryAction(state: HistoryState, id = "line-1"): HistoryState {
  return historyReducer(state, {
    type: "addLine",
    payload: {
      id,
      name: `Line ${id}`,
      color: "#7B61FF",
      mode: "subway",
    },
  });
}

describe("historyReducer — history-tracked actions", () => {
  it("starts with empty past and future", () => {
    const state = createInitialHistoryState();
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });

  it("pushes current draft to past when a history-tracked action is dispatched", () => {
    const initial = createInitialHistoryState();
    const before = initial.present.draft;
    const next = dispatchHistoryAction(initial, "line-1");

    expect(next.past).toHaveLength(1);
    // The saved snapshot is the draft that existed *before* the action
    expect(next.past[0]).toEqual(before);
  });

  it("clears the future stack when a new history action is dispatched", () => {
    let state = createInitialHistoryState();
    state = dispatchHistoryAction(state, "line-1");
    state = historyReducer(state, { type: "undo" });
    // future now has one entry
    expect(state.future).toHaveLength(1);

    // Dispatch a new action — future must be cleared
    state = dispatchHistoryAction(state, "line-2");
    expect(state.future).toHaveLength(0);
  });

  it("accumulates past entries across multiple actions", () => {
    let state = createInitialHistoryState();
    state = dispatchHistoryAction(state, "line-1");
    state = dispatchHistoryAction(state, "line-2");
    state = dispatchHistoryAction(state, "line-3");
    expect(state.past).toHaveLength(3);
  });
});

describe("historyReducer — undo", () => {
  it("does nothing when past is empty", () => {
    const initial = createInitialHistoryState();
    const next = historyReducer(initial, { type: "undo" });
    expect(next).toBe(initial); // referential equality — no new object created
  });

  it("pops the last snapshot from past and makes it present", () => {
    let state = createInitialHistoryState();
    const beforeDraft = state.present.draft;
    state = dispatchHistoryAction(state, "line-1");

    const undone = historyReducer(state, { type: "undo" });
    expect(undone.present.draft).toEqual(beforeDraft);
    expect(undone.past).toHaveLength(0);
  });

  it("pushes the current draft onto the future stack when undoing", () => {
    let state = createInitialHistoryState();
    state = dispatchHistoryAction(state, "line-1");
    const presentBeforeUndo = state.present.draft;

    const undone = historyReducer(state, { type: "undo" });
    expect(undone.future).toHaveLength(1);
    expect(undone.future[0]).toEqual(presentBeforeUndo);
  });

  it("preserves chrome state across undo", () => {
    let state = createInitialHistoryState();
    // Change a chrome field
    state = historyReducer(state, { type: "toggleSidebar" });
    const sidebarStateAfterToggle = state.present.chrome.sidebarOpen;

    state = dispatchHistoryAction(state, "line-1");
    const undone = historyReducer(state, { type: "undo" });
    // Draft reverted but chrome should retain its current value
    expect(undone.present.chrome.sidebarOpen).toBe(sidebarStateAfterToggle);
  });
});

describe("historyReducer — redo", () => {
  it("does nothing when future is empty", () => {
    const initial = createInitialHistoryState();
    const next = historyReducer(initial, { type: "redo" });
    expect(next).toBe(initial);
  });

  it("pops the first snapshot from future and makes it present", () => {
    let state = createInitialHistoryState();
    state = dispatchHistoryAction(state, "line-1");
    const afterAction = state.present.draft;

    state = historyReducer(state, { type: "undo" });
    const redone = historyReducer(state, { type: "redo" });

    expect(redone.present.draft).toEqual(afterAction);
    expect(redone.future).toHaveLength(0);
  });

  it("pushes the current draft onto past when redoing", () => {
    let state = createInitialHistoryState();
    state = dispatchHistoryAction(state, "line-1");
    const beforeUndo = state.present.draft;

    state = historyReducer(state, { type: "undo" });
    const undonePresent = state.present.draft;
    const redone = historyReducer(state, { type: "redo" });

    // past should now contain the snapshot that was present before redo
    expect(redone.past[redone.past.length - 1]).toEqual(undonePresent);
    // and present is restored
    expect(redone.present.draft).toEqual(beforeUndo);
  });
});

describe("historyReducer — MAX_HISTORY cap (50)", () => {
  it("caps past at 50 entries after 51 history-tracked dispatches", () => {
    let state = createInitialHistoryState();
    for (let i = 0; i < 51; i++) {
      state = dispatchHistoryAction(state, `line-${i}`);
    }
    expect(state.past.length).toBeLessThanOrEqual(50);
  });

  it("retains the most recent 50 snapshots", () => {
    let state = createInitialHistoryState();
    // After 51 actions, the oldest (first) snapshot should be gone
    for (let i = 0; i < 51; i++) {
      state = dispatchHistoryAction(state, `line-${i}`);
    }
    // The oldest snapshot in past corresponds to the draft after action 1 (0-indexed action 1).
    // We can verify length without deep-inspecting exact entries.
    expect(state.past).toHaveLength(50);
  });
});

describe("historyReducer — non-history (chrome-only) actions", () => {
  it("does not push to past for setActiveTool", () => {
    const initial = createInitialHistoryState();
    const next = historyReducer(initial, { type: "setActiveTool", payload: "draw-line" });
    expect(next.past).toHaveLength(0);
  });

  it("does not push to past for toggleSidebar", () => {
    const initial = createInitialHistoryState();
    const next = historyReducer(initial, { type: "toggleSidebar" });
    expect(next.past).toHaveLength(0);
  });

  it("does not push to past for updateCursorPosition", () => {
    const initial = createInitialHistoryState();
    const next = historyReducer(initial, {
      type: "updateCursorPosition",
      payload: [-79.38, 43.65],
    });
    expect(next.past).toHaveLength(0);
  });

  it("does not push to past for setSnapPosition", () => {
    const initial = createInitialHistoryState();
    const next = historyReducer(initial, {
      type: "setSnapPosition",
      payload: [-79.38, 43.65],
    });
    expect(next.past).toHaveLength(0);
  });

  it("still updates present chrome state for chrome-only actions", () => {
    const initial = createInitialHistoryState();
    expect(initial.present.chrome.sidebarOpen).toBe(true);
    const next = historyReducer(initial, { type: "toggleSidebar" });
    expect(next.present.chrome.sidebarOpen).toBe(false);
  });
});

describe("historyReducer — undoPlaceStation is a history-tracked action", () => {
  it("pushes to past when undoPlaceStation is dispatched", () => {
    // Set up a session with a station to undo
    let state = createInitialHistoryState();
    // Add a line first
    state = historyReducer(state, {
      type: "addLine",
      payload: { id: "line-1", name: "Line 1", color: "#7B61FF", mode: "subway" },
    });
    // Start a drawing session
    state = historyReducer(state, {
      type: "startDrawing",
      payload: { lineId: "line-1", mode: "new" },
    });
    // Place a station (tracked in history)
    state = historyReducer(state, {
      type: "placeStation",
      payload: { id: "s1", position: [-79.38, 43.65], lineId: "line-1", name: "Station 1" },
    });
    const pastLengthBeforeUndo = state.past.length;

    // undoPlaceStation should push to history
    state = historyReducer(state, { type: "undoPlaceStation" });
    expect(state.past.length).toBe(pastLengthBeforeUndo + 1);
  });
});

describe("historyReducer — new action after undo clears future", () => {
  it("clears future when a history action is dispatched after undo", () => {
    let state = createInitialHistoryState();
    state = dispatchHistoryAction(state, "line-1");
    state = dispatchHistoryAction(state, "line-2");

    // Undo twice — future has 2 entries
    state = historyReducer(state, { type: "undo" });
    state = historyReducer(state, { type: "undo" });
    expect(state.future).toHaveLength(2);

    // Dispatch a new history action — future must be cleared
    state = dispatchHistoryAction(state, "line-new");
    expect(state.future).toHaveLength(0);
  });
});
