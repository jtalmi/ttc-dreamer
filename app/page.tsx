export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-black/60">
            Repo Bootstrap
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-black">
            Toronto Transit Sandbox
          </h1>
        </div>
        <p className="max-w-2xl text-base leading-7 text-black/70">
          The project scaffold is in place. Product docs are ready, and the
          next step is to initialize GSD planning from the idea doc before
          Phase 1 implementation begins.
        </p>
      </div>
    </main>
  );
}
