I went through the GSD repo and user guide, and the main pattern is clear: GSD is a spec-driven workflow that initializes a project, writes `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md`, then runs each phase through a discuss → UI contract → plan → execute → verify loop. Per-phase artifacts live under `.planning/phases/...` and include `CONTEXT.md`, `RESEARCH.md`, `VERIFICATION.md`, plan/summary files, and optionally `UI-SPEC` / `UI-REVIEW` files for frontend work. ([GitHub][1])

Codex is supported by GSD. The installer lets you choose Codex as a runtime, the docs say Codex installs via `skills/gsd-*/SKILL.md`, and the verification command shown in the repo is `$gsd-help`. The user guide also says non-Claude runtimes like Codex are auto-configured with `resolve_model_ids: "omit"` so the runtime can use its own default models unless you override them in `.planning/config.json`. ([GitHub][2])

I also created a starter kit for your project in the canvas. It includes a recommended repo structure plus these draft files:

* `docs/product/gsd-idea.md`
* `docs/product/product-spec.md`
* `docs/product/ui-vision.md`
* `docs/product/phase-plan-notes.md`
* `AGENTS.md`

That starter kit is designed specifically for feeding your Toronto transit sandbox into GSD’s `new-project --auto` flow and then running the app phase by phase.

Here’s the implementation recipe I’d use in your local IDE with Codex.

## 1. Set up the repo

Create a fresh repo for the app and add the starter docs from the canvas before you initialize GSD. The reason is that GSD explicitly supports bootstrapping from an existing document via `new-project --auto`, which is the cleanest way to start from the product spec we already built. ([GitHub][1])

Recommended top-level structure:

```text
transit-sandbox/
  app/
  components/
  lib/
  public/
  styles/
  docs/
    product/
      gsd-idea.md
      product-spec.md
      ui-vision.md
      phase-plan-notes.md
  tests/
  e2e/
  README.md
  AGENTS.md
```

## 2. Install GSD for Codex

From the repo root, run:

```bash
npx get-shit-done-cc@latest
```

In the installer, choose:

* runtime: Codex
* location: local

The repo docs say the installer supports Codex directly, and local install is one of the supported modes. After install, restart/reload your Codex session if needed, then verify with:

```text
$gsd-help
```

That verification command is the one explicitly documented for Codex. ([GitHub][2])

## 3. Initialize the project from the idea doc

Use the GSD “new project from existing document” flow, pointing it at `docs/product/gsd-idea.md`. GSD documents this as the intended pattern when you already have a PRD/idea doc. ([GitHub][1])

I expect the Codex flow to be the Codex form of:

* new project
* `--auto`
* `@docs/product/gsd-idea.md`

The repo pages I read clearly show `new-project --auto @prd.md`, but they do **not** clearly spell out every Codex-specific invocation form beyond `$gsd-help`, so use `$gsd-help` to confirm the exact Codex syntax before running it. ([GitHub][1])

## 4. Let GSD generate the planning spine

After init, GSD should generate the main `.planning` files:

* `PROJECT.md`
* `REQUIREMENTS.md`
* `ROADMAP.md`
* `STATE.md`
* project research files

That is the documented output of `new-project`. ([GitHub][2])

At this point, do a quick review pass and make sure:

* the product goal is framed as a desktop-first Toronto transit sandbox
* v1 is fun-first, not planning-grade
* the roadmap is broken into small frontend-friendly phases
* the requirements reflect your actual v1 boundaries

## 5. Use this exact phase rhythm

For each phase, follow the GSD lifecycle rather than asking Codex to “just build the whole thing.” The user guide’s recommended lifecycle is:

1. discuss the phase
2. lock UI decisions if it’s a frontend phase
3. plan the phase
4. execute the phase
5. verify manually
6. ship if satisfied

That is the core GSD loop. ([GitHub][1])

For your project, I’d run it like this:

### Phase 1

App shell + full-screen editor + toolbar + collapsible sidebar + proposal state model + baseline toggle shell

### Phase 2

Toronto baseline rendering + GO context + neighbourhoods + streets + landmarks + station labels + toggleable bus/streetcar corridors

### Phase 3

Core editing: new lines, line extension/branching, manual stations, shared stations, interchange suggestion flow, undo/redo/delete

### Phase 4

Inspectors + live descriptive stats + before/after toggle

### Phase 5

Sharing: title/display name, image export, unlisted share link, shared view mode, edit-as-copy

That matches the project shape we defined and keeps each phase small enough for GSD’s planning/execution model.

## 6. Keep frontend decisions inside GSD’s UI contract

Because this app is UI-heavy, you should use GSD’s UI design contract step on every frontend-heavy phase. The user guide says `/gsd:ui-phase` exists specifically to prevent visually inconsistent AI-built frontends, and it writes a `{phase}-UI-SPEC.md` into the phase folder before execution. ([GitHub][1])

For this project, that matters a lot. Use it to lock:

* map-first layout
* Toronto-forward visual hierarchy
* transit line contrast and line styling
* sidebar behavior
* onboarding tone
* inspector density
* typography and spacing rules

## 7. What to tell Codex during discuss-phase

For your first few phases, make sure the discuss step locks in the following preferences so GSD writes them into `CONTEXT.md` instead of leaving them as vague memory:

* desktop-first creation
* Toronto-native geographic context
* baseline TTC network fixed except for allowed extensions/branches
* manual station placement with light snapping
* descriptive stats, not authoritative scoring
* freeform editing with no realism warnings
* unlisted sharing by default
* view-first shared links, then “make your own version”

That matters because GSD uses `CONTEXT.md` as one of the key inputs to planning. ([GitHub][1])

## 8. A good “first command stack” in practice

Once install is verified and the starter docs are in place, the sequence should be:

1. initialize project from `docs/product/gsd-idea.md`
2. run phase 1 discuss
3. run phase 1 UI contract
4. run phase 1 planning
5. execute phase 1
6. verify phase 1 manually
7. repeat for phase 2

That mirrors the usage examples in the docs. ([GitHub][1])

## 9. Use the lighter commands deliberately

GSD also has lighter-weight commands:

* `fast` for trivial tasks
* `quick` for ad hoc tasks
* backlog/todo/thread commands for ideas
* workstreams for parallel planning state

These are useful, but I would **not** use them for your main product build at the start. Use the full phase flow for core product work, then use lighter commands only for small polish or bug-fix tasks later. The user guide positions `fast`/`quick` for small changes and workstreams for parallel, isolated milestone work. ([GitHub][1])

## 10. Two GSD caveats worth knowing up front

There are open issues reporting that GSD subagents may not reliably inherit project-level `CLAUDE.md` or project-level `.agents/skills`, which means important product rules can be invisible to the planner/executor unless they are also captured in the GSD docs themselves. There is also an open issue reporting that phase completion may not always update `REQUIREMENTS.md` traceability correctly. Treat both as things to watch, not as blockers. ([GitHub][3])

Practically, that means:

* put critical product rules into `docs/product/*` and make sure they get pulled into `PROJECT.md` / `CONTEXT.md`
* after each phase, manually inspect `REQUIREMENTS.md` and `ROADMAP.md` before assuming traceability is perfect

## 11. My recommendation for your repo on day one

Start with these as the only hard source-of-truth docs outside `.planning`:

* `docs/product/gsd-idea.md`
* `docs/product/product-spec.md`
* `docs/product/ui-vision.md`
* `docs/product/phase-plan-notes.md`
* `AGENTS.md`

Then let GSD generate and own the `.planning/` layer. GSD is designed around `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, and per-phase planning files, so you want your permanent human-authored docs to be concise inputs, not a second competing planning system. ([GitHub][1])

## 12. Best next move

Open the canvas starter kit, copy those files into your repo, install GSD locally for Codex, verify with `$gsd-help`, then initialize from `docs/product/gsd-idea.md`.

After that, your first implementation target should be only:

* full-screen map shell
* toolbar scaffold
* collapsible sidebar scaffold
* proposal state model
* today/future baseline toggle shell

Nothing else in phase 1. That gives GSD a tight, realistic first phase and avoids the “build the whole app at once” trap GSD is designed to prevent. ([GitHub][1])

If you want, next I’ll turn the canvas starter kit into an exact repo bootstrap pack with ready-to-paste file contents plus a recommended phase-1 tech stack.

[1]: https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md "https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md"
[2]: https://github.com/gsd-build/get-shit-done "https://github.com/gsd-build/get-shit-done"
[3]: https://github.com/gsd-build/get-shit-done/issues/671 "https://github.com/gsd-build/get-shit-done/issues/671"
