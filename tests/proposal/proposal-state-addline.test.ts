import { describe, it, expect } from "vitest";
import { proposalEditorReducer, createInitialProposalDraft } from "@/lib/proposal/proposal-state";

describe("addLine action — extend/branch fields", () => {
  const baseState = createInitialProposalDraft();

  it("forwards parentLineId to the created line", () => {
    const next = proposalEditorReducer(baseState, {
      type: "addLine",
      payload: {
        id: "line-1",
        name: "Extension",
        mode: "subway",
        color: "#7B61FF",
        parentLineId: "ttc-42",
      },
    });
    expect(next.draft.lines[0].parentLineId).toBe("ttc-42");
  });

  it("forwards isExtension=true to the created line", () => {
    const next = proposalEditorReducer(baseState, {
      type: "addLine",
      payload: {
        id: "line-2",
        name: "Extension",
        mode: "subway",
        color: "#7B61FF",
        isExtension: true,
      },
    });
    expect(next.draft.lines[0].isExtension).toBe(true);
  });

  it("forwards branchPoint to the created line", () => {
    const branchPoint: [number, number] = [-79.38, 43.65];
    const next = proposalEditorReducer(baseState, {
      type: "addLine",
      payload: {
        id: "line-3",
        name: "Branch",
        mode: "subway",
        color: "#E91E8C",
        branchPoint,
      },
    });
    expect(next.draft.lines[0].branchPoint).toEqual(branchPoint);
  });

  it("leaves parentLineId/isExtension/branchPoint undefined when not provided", () => {
    const next = proposalEditorReducer(baseState, {
      type: "addLine",
      payload: {
        id: "line-4",
        name: "Free Line",
        mode: "lrt",
        color: "#00B4D8",
      },
    });
    const line = next.draft.lines[0];
    expect(line.parentLineId).toBeUndefined();
    expect(line.isExtension).toBeUndefined();
    expect(line.branchPoint).toBeUndefined();
  });
});
