import type { ProposalDraft } from "@/lib/proposal/proposal-types";

/** v1 payload shape — kept for migration from existing share URLs. */
export type SharePayloadV1 = {
  /** Schema version — always 1 in v1. */
  v: 1;
  draft: ProposalDraft;
  /** Optional display name — not stored in ProposalDraft, only in the share link. */
  author?: string;
};

/** v2 payload shape — station-first model. */
export type SharePayloadV2 = {
  /** Schema version — always 2 in v2. */
  v: 2;
  draft: ProposalDraft;
  /** Optional display name — not stored in ProposalDraft, only in the share link. */
  author?: string;
};

/** Union of all payload versions the decoder accepts. */
export type SharePayload = SharePayloadV1 | SharePayloadV2;
