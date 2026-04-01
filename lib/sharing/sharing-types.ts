import type { ProposalDraft } from "@/lib/proposal/proposal-types";

/** Serialized payload embedded in a share URL hash. */
export type SharePayload = {
  /** Schema version — always 1 in v1. Future versions can add migration logic. */
  v: 1;
  draft: ProposalDraft;
  /** Optional display name — not stored in ProposalDraft, only in the share link. */
  author?: string;
};
