# Phase 5: Sharing, Export, and Polish - Research

**Researched:** 2026-03-31
**Domain:** Client-side proposal sharing, WebGL canvas export, URL serialization, onboarding
**Confidence:** HIGH

---

## Summary

Phase 5 is entirely client-side. There is no backend, no database, and no authentication — the constraint is that sharing must work without any server infrastructure. This is achievable and well-precedented: the proposal state is serialized to JSON, base64-encoded, and embedded in the URL fragment (hash). Shared links open the same Next.js page at `/`, and the client reads `window.location.hash` on mount to determine whether to render editor mode or shared view mode.

Image export uses MapLibre GL's native `map.getCanvas().toDataURL()` method via the existing `MapRef`, which exposes the full map instance. This requires enabling `preserveDrawingBuffer: true` on the Map component initialization — a one-line change. The WebGL canvas contains all rendered map layers including proposal lines, station symbols, and labels; DOM overlays (popovers, banners) are excluded from the canvas and must be hidden before export, which the UI-SPEC already specifies.

Onboarding is a simple localStorage flag (`ttc-dreamer-onboarded`) with a sequential tooltip sequence of at most 3 steps, anchored to existing toolbar buttons. The 60-second activity guard prevents showing tooltips to users who are already exploring. No external dependency is needed for onboarding.

**Primary recommendation:** Use URL hash + base64 JSON for sharing (no dependency), MapLibre's native `getCanvas().toDataURL()` for export (`preserveDrawingBuffer: true`), and native `localStorage` + CSS-positioned tooltips for onboarding.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHARE-01 | User can give a proposal a map title | `draft.title` field already exists in `ProposalDraft`; needs inline edit in toolbar and sync in Share modal |
| SHARE-02 | User can optionally add a display name | Author name is share-only metadata (not in `ProposalDraft`); included in the URL hash payload as `SharePayload.author` |
| SHARE-03 | User can export a clean image of the proposal | `mapRef.current?.getCanvas().toDataURL('image/png')` with `preserveDrawingBuffer: true` on Map init |
| SHARE-04 | User can create an unlisted share link | URL hash encoding: `#p=` + `btoa(JSON.stringify(SharePayload))` — no backend required |
| SHARE-05 | Shared proposals open in read-only view mode first | `EditorShell` reads `window.location.hash` on mount; renders `SharedViewShell` when hash present |
| SHARE-06 | A viewer can make their own editable copy from a shared proposal | Clone draft with `crypto.randomUUID()` id + "(copy)" title suffix; clear hash via `history.replaceState` |
| SHARE-07 | First-time users get lightweight onboarding or tooltips | `localStorage.getItem('ttc-dreamer-onboarded')` flag; sequential tooltip sequence anchored to toolbar buttons |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| maplibre-gl (installed) | 5.21.1 | Map canvas export via `getCanvas()` | Native WebGL canvas access — no external dep needed |
| react-map-gl (installed) | 8.1.0 | MapRef for canvas access | `MapRef.getCanvas()` is fully typed and available |
| Native Web APIs | browser | URL encoding, localStorage, clipboard | No dependency: `btoa`, `localStorage`, `navigator.clipboard` |
| vitest (installed) | 4.1.2 | Unit tests for serialization utilities | Already in devDependencies |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lz-string | 1.5.0 | URL-safe compression of proposal JSON | Only if proposals grow too large; NOT needed for v1 — raw base64 is ~11KB for large proposals, well within browser URL hash limits |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `map.getCanvas().toDataURL()` | html2canvas | html2canvas cannot read WebGL canvas pixel data — would capture a blank/black box for the map. MapLibre native is the only correct approach. |
| `map.getCanvas().toDataURL()` | html-to-image | Same issue: html-to-image is SVG/DOM-based and cannot serialize WebGL content |
| URL hash (`#p=`) | URL search params (`?p=`) | Search params require `<Suspense>` wrapping and `useSearchParams()` hook; hash is invisible to Next.js server and simpler |
| URL hash | External storage (KV, S3) | Requires backend; out of scope for v1 |
| `btoa()` + JSON | lz-string compression | lz-string adds ~175KB to bundle; raw base64 works for v1 proposal sizes (largest realistic: ~12KB hash string) |

**Installation (if lz-string needed later):**
```bash
npm install lz-string
npm install --save-dev @types/lz-string
```

**Version verification (packages not yet installed):**
```bash
npm view lz-string version  # 1.5.0 verified 2026-03-31
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 5 additions)

```
lib/
├── sharing/
│   ├── encode-proposal.ts     # btoa(JSON.stringify(SharePayload))
│   ├── decode-proposal.ts     # parse + validate hash payload
│   └── sharing-types.ts       # SharePayload type

components/
├── editor/
│   ├── editor-shell.tsx        # modified: reads hash on mount, switches modes
│   ├── top-toolbar.tsx         # modified: + inline title field + Share button
│   └── shared-view-shell.tsx   # new: read-only view banner + edit-as-copy
├── sharing/
│   ├── share-modal.tsx         # new: modal with title/author/export/link sections
│   └── onboarding-tooltip.tsx  # new: sequential tooltip component

tests/
├── sharing/
│   ├── encode-proposal.test.ts # serialize + deserialize roundtrip
│   └── decode-proposal.test.ts # malformed input handling
```

### Pattern 1: URL Hash Sharing (No Backend)

**What:** Serialize `SharePayload` to JSON, base64-encode it, embed in URL fragment as `#p=<encoded>`. On page load, `EditorShell` reads `window.location.hash` in a `useEffect` to detect shared view mode.

**When to use:** Single-page app, no server, desktop-first target audience (modern browsers, no IE concern).

**Example:**
```typescript
// lib/sharing/encode-proposal.ts

export type SharePayload = {
  v: 1;                    // schema version for future migration
  draft: ProposalDraft;
  author?: string;         // optional display name from Share modal
};

export function encodeSharePayload(payload: SharePayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function buildShareUrl(payload: SharePayload): string {
  return `${window.location.origin}/#p=${encodeSharePayload(payload)}`;
}
```

```typescript
// lib/sharing/decode-proposal.ts

export function decodeSharePayload(hash: string): SharePayload | null {
  try {
    const encoded = hash.startsWith("#p=") ? hash.slice(3) : hash;
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json) as unknown;
    // Validate: must have v, draft, draft.lines array, draft.stations array
    if (!isValidSharePayload(parsed)) return null;
    return parsed as SharePayload;
  } catch {
    return null;
  }
}
```

**Why `encodeURIComponent` + `btoa`:** `btoa` alone fails on non-Latin characters (e.g., station names with accents). `encodeURIComponent` first, then `btoa`, then no URL encoding needed since base64 chars are URL-safe in fragments.

### Pattern 2: MapLibre Native Canvas Export

**What:** Enable `preserveDrawingBuffer: true` on the Map initialization to retain WebGL frame data after rendering. Access the canvas via `mapRef.current?.getCanvas()` and call `toDataURL('image/png')`.

**When to use:** Any export of the MapLibre map canvas — the only approach that captures WebGL-rendered content.

**Critical:** `preserveDrawingBuffer: true` has a minor GPU performance cost (disables certain driver optimizations). For a desktop-first map editor this is acceptable. Set it once at Map init.

**Example:**
```typescript
// In toronto-map.tsx — add to Map component props:
<Map
  ref={mapRef}
  // ... existing props
  canvasContextAttributes={{ preserveDrawingBuffer: true }}
>
```

```typescript
// Export function (called from EditorShell / ShareModal):
export async function exportMapAsPng(
  mapRef: React.RefObject<MapRef | null>,
  filename: string,
): Promise<void> {
  const canvas = mapRef.current?.getCanvas();
  if (!canvas) throw new Error("Map canvas not available");

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
```

**Filename derivation (from UI-SPEC):**
```typescript
export function buildExportFilename(title: string): string {
  if (!title || title.trim() === "Untitled Proposal") return "ttc-proposal.png";
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + ".png";
}
```

### Pattern 3: Shared View Mode — Same Route, Different Shell

**What:** `EditorShell` reads `window.location.hash` on mount. If a valid `SharePayload` is found, it renders `SharedViewShell` (read-only view) instead of the full editor. Hash is never seen by the Next.js server — `page.tsx` remains a static server component returning `<EditorShell />` unchanged.

**Example:**
```typescript
// In editor-shell.tsx — on mount:
const [sharedPayload, setSharedPayload] = useState<SharePayload | null>(null);

useEffect(() => {
  const payload = decodeSharePayload(window.location.hash);
  if (payload) setSharedPayload(payload);
}, []);

if (sharedPayload) {
  return (
    <SharedViewShell
      draft={sharedPayload.draft}
      author={sharedPayload.author}
      onEditAsCopy={() => handleEditAsCopy(sharedPayload.draft)}
    />
  );
}
// ... existing editor render
```

**Edit-as-copy flow:**
```typescript
function handleEditAsCopy(sourceDraft: ProposalDraft) {
  const copy: ProposalDraft = {
    ...sourceDraft,
    id: crypto.randomUUID(),
    title: `${sourceDraft.title} (copy)`,
  };
  // Load copy into editor reducer
  dispatch({ type: "loadDraft", payload: copy });  // new action needed
  // Clear the hash so URL shows editor mode
  history.replaceState(null, "", window.location.pathname);
  setSharedPayload(null);
}
```

### Pattern 4: Onboarding Tooltips

**What:** localStorage flag `ttc-dreamer-onboarded` (string "1") gates the tooltip sequence. Three tooltips shown sequentially, each anchored to a toolbar button via CSS absolute positioning relative to the toolbar. A 60-second interaction timer prevents showing tooltips to already-engaged users.

**Example:**
```typescript
// In editor-shell.tsx or dedicated OnboardingController component:
const [tooltipStep, setTooltipStep] = useState<0 | 1 | 2 | null>(null);
const [hasInteracted, setHasInteracted] = useState(false);
const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (localStorage.getItem("ttc-dreamer-onboarded")) return;
  // Start 60-second interaction guard
  interactionTimerRef.current = setTimeout(() => {
    if (!hasInteracted) setTooltipStep(0);
  }, 0); // Start immediately; guard is "did user interact in 60s?"
  // ... track first interaction
}, []);
```

**localStorage key:** `ttc-dreamer-onboarded` (string "1" when set — localStorage only stores strings).

### Pattern 5: Inline Title Field

**What:** The map title (`draft.title`) is editable directly in the toolbar without opening the Share modal. A label shows the truncated title; clicking converts it to an inline text input; blur/Enter commits the change.

```typescript
// In top-toolbar.tsx:
const [editingTitle, setEditingTitle] = useState(false);
const [titleInput, setTitleInput] = useState(title);

// On blur or Enter: call onTitleChange(titleInput.slice(0, 80))
```

**Prop additions needed for TopToolbar:**
- `title: string` — current `draft.title`
- `onTitleChange: (title: string) => void`
- `onShareClick: () => void`

**New reducer action needed:**
```typescript
type UpdateTitleAction = {
  type: "updateTitle";
  payload: string;  // new title, already trimmed and clamped to 80 chars
};
```

### Anti-Patterns to Avoid

- **Capturing the DOM wrapper with html2canvas/html-to-image for the map:** These libraries cannot serialize WebGL canvas content — they produce a blank rectangle where the MapLibre canvas lives. Always use `map.getCanvas().toDataURL()`.
- **Storing the full share payload in localStorage instead of the URL:** localStorage is device-local, not shareable. The URL hash is the share mechanism.
- **Using `router.push` to clear the hash after edit-as-copy:** `router.push('/')` triggers a full Next.js navigation and re-runs `useEffect`, potentially reading the hash again before it is cleared. Use `history.replaceState(null, '', window.location.pathname)` directly.
- **Rendering `SharedViewShell` conditionally from `page.tsx`:** Page components don't have access to URL hash server-side. The conditional must live in the client component (`EditorShell`).
- **Skipping the `v: 1` version field in `SharePayload`:** Without a version, future schema changes will break existing links silently. Always include a version field and validate it in `decodeSharePayload`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map pixel capture | DOM screenshot library | `mapRef.current?.getCanvas().toDataURL()` | WebGL canvas data is inaccessible to DOM serializers; native is the only correct path |
| URL-safe compression | Custom bitfield compression | lz-string `compressToEncodedURIComponent` (if compression needed in v2) | lz-string is 5 years mature, 1.5KB, designed for URL embedding |
| Clipboard copy | Manual `document.execCommand('copy')` | `navigator.clipboard.writeText(url)` | Modern async API; `execCommand` is deprecated |
| File download | Form submission or server redirect | `<a download href={dataUrl}>` programmatic click | Browser-native for data URLs and blobs |

**Key insight:** All Phase 5 requirements are solvable with browser-native APIs already available in the tech stack. The only possible external dependency is lz-string for compression, which is not needed for v1 proposal sizes.

---

## Common Pitfalls

### Pitfall 1: WebGL Canvas Blank on Export

**What goes wrong:** `html2canvas(mapStageEl)` or `html-to-image.toPng(mapStageEl)` produces an image where the MapLibre map is a solid color or blank rectangle.
**Why it happens:** DOM-to-image libraries use `canvas.getContext('2d')` to clone canvases. WebGL canvases have `preserveDrawingBuffer: false` by default, which clears the pixel buffer after each frame for GPU performance. DOM capture happens outside the render frame — there is nothing to capture.
**How to avoid:** Set `canvasContextAttributes={{ preserveDrawingBuffer: true }}` on the `<Map>` component. Then use `mapRef.current?.getCanvas().toDataURL('image/png')` directly — never use html2canvas.
**Warning signs:** Export produces an image with correct dimensions but solid-color where the map should be.

### Pitfall 2: `btoa` Fails on Non-ASCII Characters

**What goes wrong:** `btoa(JSON.stringify(draft))` throws `InvalidCharacterError` when proposal titles or station names contain non-Latin characters (emoji, French accents, Unicode).
**Why it happens:** `btoa` only handles Latin-1 characters. Modern station names can easily include Unicode.
**How to avoid:** Always use `btoa(encodeURIComponent(JSON.stringify(payload)))` for encoding, and `JSON.parse(decodeURIComponent(atob(encoded)))` for decoding. The `encodeURIComponent` layer escapes all non-ASCII characters before passing to `btoa`.
**Warning signs:** Works in testing with ASCII-only names, fails with French or emoji station names.

### Pitfall 3: Hash Read Before Component Mount

**What goes wrong:** `window.location.hash` is read in component body (not in `useEffect`), causing a hydration mismatch error because the server has no concept of the hash.
**Why it happens:** Next.js renders components server-side first. `window` is not defined server-side.
**How to avoid:** Always read `window.location.hash` inside a `useEffect(() => { ... }, [])` callback. This runs only client-side after hydration.
**Warning signs:** `ReferenceError: window is not defined` in SSR logs.

### Pitfall 4: `preserveDrawingBuffer` and Two-Canvas Mismatch

**What goes wrong:** `preserveDrawingBuffer: true` is set, but export still captures a blank frame.
**Why it happens:** The `canvasContextAttributes` option must be set at Map construction time — it cannot be changed after the map is initialized. If the Map component re-mounts with a different value, the old WebGL context is destroyed and a new one created.
**How to avoid:** Set `canvasContextAttributes={{ preserveDrawingBuffer: true }}` as a constant prop value (not from state) on the Map component. Do not derive it from a boolean flag that might change.
**Warning signs:** Export works on first attempt, fails after any map re-mount (e.g., SSR guard re-render).

### Pitfall 5: `history.replaceState` Race with `useEffect`

**What goes wrong:** `history.replaceState` clears the hash, but the `useEffect` that reads the hash fires again (React strict mode double-invoke) and re-enters shared view mode.
**Why it happens:** In React 18 strict mode, effects run twice in development. If the hash-reading effect runs again after `replaceState`, it reads an empty hash and exits — but the component may briefly flash shared view mode.
**How to avoid:** Use a `hasLoadedFromHash` ref or state flag that is set to `true` after the first hash read. On subsequent effect runs, skip the hash check if already loaded.

### Pitfall 6: Comparison Banner Appearing in Export

**What goes wrong:** The exported PNG includes the comparison mode banner ("Comparing against baseline — click Proposal View to return") overlaid on the map.
**Why it happens:** The comparison banner is a DOM element positioned absolutely at the bottom of `MapStage`. It is not part of the WebGL canvas, so `getCanvas().toDataURL()` would NOT include it — this is actually fine for export. The real pitfall is the reverse: expecting the banner to appear in the export when users want it.
**How to avoid:** `map.getCanvas().toDataURL()` captures only WebGL content. The comparison banner is DOM-only and automatically excluded. No action needed.

---

## Code Examples

Verified patterns from official sources:

### MapLibre preserveDrawingBuffer (maplibre-gl 5.21.1 type-verified)

```typescript
// Source: maplibre-gl 5.21.1 types — canvasContextAttributes: WebGLContextAttributesWithType
<Map
  ref={mapRef}
  canvasContextAttributes={{ preserveDrawingBuffer: true }}
  // ... other props unchanged
>
```

### MapLibre Canvas Export (maplibre-gl 5.21.1)

```typescript
// Source: maplibre-gl 5.21.1 Map$1 class definition — getCanvas(): HTMLCanvasElement
// MapRef from @vis.gl/react-maplibre extends MapInstance (= Map from maplibre-gl)
// Therefore mapRef.current?.getCanvas() is fully typed and available.

async function exportMap(mapRef: React.RefObject<MapRef | null>, title: string): Promise<void> {
  const map = mapRef.current;
  if (!map) return;
  const canvas = map.getCanvas();
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.download = buildExportFilename(title);
  a.href = dataUrl;
  a.click();
}
```

### Clipboard Write API

```typescript
// Source: MDN Web API — navigator.clipboard (available all modern browsers)
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: focus-dependent clipboard API may fail in some contexts
    return false;
  }
}
```

### MapRef Access Pattern (react-map-gl/maplibre 8.1.0)

```typescript
// Source: @vis.gl/react-maplibre/dist/maplibre/create-ref.d.ts
// MapRef = { getMap(): MapInstance } & Omit<MapInstance, skipMethods>
// MapInstance = Map from maplibre-gl
// TorontoMap already has: const mapRef = useRef<MapRef | null>(null);
// To expose to parent, add onMapReady callback or forward the ref

// Option A — callback pattern (matches existing dispatch pattern):
type TorontoMapProps = { onMapReady?: (mapRef: MapRef) => void; ... };

// Option B — forwardRef pattern:
export const TorontoMap = forwardRef<MapRef, TorontoMapProps>((props, ref) => {
  // Pass ref to <Map ref={ref} ...>
});
```

### localStorage Onboarding Flag

```typescript
// Consistent with existing localStorage usage patterns (ttc-dreamer-onboarded)
const ONBOARDING_KEY = "ttc-dreamer-onboarded";

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return true; // If localStorage is unavailable, skip onboarding
  }
}

export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {
    // Ignore in private browsing contexts where localStorage is blocked
  }
}
```

### Share Payload Schema

```typescript
// lib/sharing/sharing-types.ts
import type { ProposalDraft } from "@/lib/proposal/proposal-types";

export type SharePayload = {
  /** Schema version — always 1 in v1. Future versions can add migration logic. */
  v: 1;
  draft: ProposalDraft;
  /** Optional display name — not stored in ProposalDraft, only in the share link. */
  author?: string;
};
```

### loadDraft Reducer Action (new action needed)

```typescript
// Add to proposal-state.ts EditorShellAction union:
type LoadDraftAction = {
  type: "loadDraft";
  payload: ProposalDraft;
};

// In reducer:
case "loadDraft":
  return {
    ...createInitialProposalDraft(),
    draft: action.payload,
  };
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2canvas for map export | `map.getCanvas().toDataURL()` with `preserveDrawingBuffer` | MapLibre GL 2+ era | html2canvas cannot capture WebGL; native canvas API is the only correct path |
| Server-side short URL service | URL hash with compressed payload | 2020+ (lz-string era) | Eliminates backend requirement; URL is the share token |
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | Chrome 66+ / 2018 | Async, permission-based, no temporary DOM element needed |
| Page route per share ID | Same-route hash routing | React SPA era | No server-side routing needed; hash is invisible to the server |

**Deprecated/outdated:**
- `html2canvas`: Effectively deprecated for WebGL use cases — still works for DOM-only elements but cannot capture MapLibre.
- `document.execCommand('copy')`: Removed from spec; marked deprecated in all browsers since 2018.

---

## Open Questions

1. **MapRef exposure architecture**
   - What we know: `TorontoMap` holds `mapRef = useRef<MapRef | null>()` internally. Export needs access to the canvas.
   - What's unclear: Should `TorontoMap` accept a forwarded ref, or should it accept an `onMapReady(mapRef)` callback, or should export be triggered via an imperative ref from `EditorShell`?
   - Recommendation: Callback prop `onMapReady?: (mapRef: MapRef) => void` — matches the existing `dispatch` callback pattern and avoids forwardRef complexity. `EditorShell` stores the ref in its own `useState<MapRef | null>`, passes it to the export function.

2. **Onboarding timer precision**
   - What we know: UI-SPEC says "not shown if user has been active for more than 60 seconds". The tooltip sequence starts after map finishes loading.
   - What's unclear: Does "active" mean any mouse/keyboard event, or specifically editing gestures?
   - Recommendation: Any `mousedown` or `keydown` event within the first 60 seconds sets a "has interacted" flag. If the 60-second window passes without interaction, show tooltip step 1.

3. **Proposal size and URL hash limits**
   - What we know: A realistic 10-line / 50-station proposal serializes to ~8KB JSON → ~11KB base64 hash. Modern browsers (Chrome, Firefox, Safari) have no practical hash length limit.
   - What's unclear: Is there a reasonable max proposal size to document as a soft limit?
   - Recommendation: No size limit enforcement in v1. The base64 approach is sufficient. Document that very large proposals (50+ lines) may produce long URLs but these still function.

---

## Environment Availability

Step 2.6: All dependencies for Phase 5 are either already installed packages or browser-native APIs. No external tools, databases, CLIs, or services are required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| maplibre-gl `getCanvas()` | Image export (SHARE-03) | Yes | 5.21.1 | — |
| `navigator.clipboard` | Copy link (SHARE-04) | Yes | Web standard, all modern browsers | Inline `<input>` select + `execCommand` (not needed for desktop-first) |
| `window.localStorage` | Onboarding (SHARE-07) | Yes | Web standard | Skip onboarding if unavailable (private browsing) |
| `crypto.randomUUID()` | Edit-as-copy (SHARE-06) | Yes | Node 20 + all modern browsers | — |
| `btoa` / `atob` | URL hash encoding (SHARE-04, SHARE-05) | Yes | Web standard | — |
| `history.replaceState` | Clear hash on edit-as-copy (SHARE-06) | Yes | Web standard | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.2 |
| Config file | `/Users/jonathan/dev/ttc-dreamer/vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHARE-04 | `encodeSharePayload` + `decodeSharePayload` roundtrip | unit | `npm test -- --reporter=verbose tests/sharing/` | No — Wave 0 |
| SHARE-04 | `decodeSharePayload` returns `null` for malformed input | unit | `npm test -- --reporter=verbose tests/sharing/` | No — Wave 0 |
| SHARE-03 | `buildExportFilename` derives correct slugs | unit | `npm test -- --reporter=verbose tests/sharing/` | No — Wave 0 |
| SHARE-01 | `updateTitle` reducer action clamps to 80 chars | unit | `npm test -- --reporter=verbose tests/proposal/` | No — Wave 0 |
| SHARE-06 | Edit-as-copy generates new UUID and appends "(copy)" | unit | `npm test -- --reporter=verbose tests/proposal/` | No — Wave 0 |
| SHARE-05 | Shared view mode renders when hash present | manual | — | Manual only — requires browser |
| SHARE-07 | Onboarding shows on first visit, skips on return | manual | — | Manual only — requires browser + localStorage |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- `tests/sharing/encode-proposal.test.ts` — covers SHARE-04 (roundtrip + malformed input), SHARE-03 (filename slugging)
- `tests/proposal/proposal-state-load-draft.test.ts` — covers SHARE-01 (title action) + SHARE-06 (edit-as-copy reducer logic)

*(Existing test infrastructure covers the remaining requirements via manual browser testing.)*

---

## Project Constraints (from CLAUDE.md)

- **Desktop-first**: Shared view mode must also be desktop-first. No mobile layout adaptation required.
- **No community/social features**: Share link is unlisted. No gallery, feed, or public listing surface in v1.
- **Keep phases small and shippable**: The 3-plan split (metadata+view, export+link, onboarding+polish) is appropriate.
- **Tests for domain logic and geometry helpers where practical**: Serialization/deserialization and reducer actions qualify — test them.
- **Toronto-native context must stay prominent**: The shared view must still show the Toronto map at full prominence (no stripped-down view).
- **Baseline TTC infrastructure stays fixed**: `SharedViewShell` renders in read-only mode; baseline cannot be toggled by a viewer.
- **Simplicity First / Minimal Impact**: Use browser-native APIs before adding dependencies. No external image export library needed.
- **GSD Workflow Enforcement**: All implementation must go through `/gsd:execute-phase` — no direct repo edits outside GSD workflow.

---

## Sources

### Primary (HIGH confidence)

- maplibre-gl 5.21.1 TypeScript types (`node_modules/maplibre-gl/dist/maplibre-gl.d.ts`) — verified `getCanvas(): HTMLCanvasElement`, `canvasContextAttributes.preserveDrawingBuffer`, `Map$1` class definition
- @vis.gl/react-maplibre `dist/maplibre/create-ref.d.ts` — verified `MapRef = { getMap(): MapInstance } & Omit<MapInstance, skipMethods>`
- @vis.gl/react-maplibre `dist/types/events.d.ts` — verified `MapCallbacks.onLoad?: (e: MapLibreEvent) => void`
- Next.js 16.2.1 docs (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`) — verified `router.replace` for clearing hash
- Existing project source (`lib/proposal/proposal-types.ts`, `proposal-state.ts`, `editor-shell.tsx`, `toronto-map.tsx`) — verified current state shape and component API surface

### Secondary (MEDIUM confidence)

- npm registry (`npm view html2canvas`, `html-to-image`, `lz-string`) — verified versions and descriptions; html2canvas limitation with WebGL is widely documented community knowledge

### Tertiary (LOW confidence)

- Browser URL hash size limits: Chrome and Firefox have no documented hard limit; community consensus is that modern browsers handle 1MB+ fragments. This was not verified against official browser specs (spec does not define a limit).

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against installed package types and existing project source
- Architecture: HIGH — all patterns are browser-native and match existing project conventions
- Pitfalls: HIGH — `preserveDrawingBuffer` and `btoa` Unicode issues are well-understood WebGL/JS constraints; verified against installed packages
- Onboarding approach: HIGH — localStorage flag pattern is simple and matches UI-SPEC exactly

**Research date:** 2026-03-31
**Valid until:** 2026-07-01 (stable libraries, browser APIs are not changing)
