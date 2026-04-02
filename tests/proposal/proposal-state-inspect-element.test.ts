import { describe, expect, it } from "vitest";
import { createInitialProposalDraft, proposalEditorReducer } from "@/lib/proposal/proposal-state";

describe("inspectElement reducer", () => {
  it("sets both the inspected and selected element when opening an inspector", () => {
    const base = createInitialProposalDraft();

    const next = proposalEditorReducer(base, {
      type: "inspectElement",
      payload: { id: "line-1", elementType: "line" },
    });

    expect(next.chrome.selectedElementId).toBe("line-1");
    expect(next.chrome.inspectedElementId).toBe("line-1");
    expect(next.chrome.sidebarPanel).toBe("inspect-line");
    expect(next.chrome.sidebarOpen).toBe(true);
  });

  it("clears selection when the inspector is closed", () => {
    const inspected = proposalEditorReducer(createInitialProposalDraft(), {
      type: "inspectElement",
      payload: { id: "station-1", elementType: "station" },
    });

    const closed = proposalEditorReducer(inspected, { type: "closeInspector" });

    expect(closed.chrome.selectedElementId).toBeNull();
    expect(closed.chrome.inspectedElementId).toBeNull();
    expect(closed.chrome.sidebarPanel).toBe("list");
  });

  it("stores baseline inspection metadata for existing network clicks", () => {
    const base = createInitialProposalDraft();

    const next = proposalEditorReducer(base, {
      type: "inspectElement",
      payload: {
        id: "baseline-station:ttc:1657924",
        elementType: "baseline-station",
        inspection: {
          type: "baseline-station",
          sourceId: "1657924",
          system: "ttc",
          name: "EGLINTON",
          position: [-79.3983, 43.7053],
          address: "2190 Yonge St",
          municipality: "Toronto",
          accessibility: "Yes",
        },
      },
    });

    expect(next.chrome.selectedElementId).toBe("baseline-station:ttc:1657924");
    expect(next.chrome.inspectedElementId).toBe("baseline-station:ttc:1657924");
    expect(next.chrome.sidebarPanel).toBe("inspect-baseline-station");
    expect(next.chrome.inspectedBaseline).toEqual({
      type: "baseline-station",
      sourceId: "1657924",
      system: "ttc",
      name: "EGLINTON",
      position: [-79.3983, 43.7053],
      address: "2190 Yonge St",
      municipality: "Toronto",
      accessibility: "Yes",
    });
  });
});
