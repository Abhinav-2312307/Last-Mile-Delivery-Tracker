import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
        <nav className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-[var(--muted)]">
              Operations Console
            </p>
            <h1 className="text-2xl font-semibold">Last-Mile Delivery Tracker</h1>
          </div>
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            href="/login"
          >
            Sign in
          </Link>
        </nav>

        <div className="grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
              Dispatch, pricing, and tracking
            </p>
            <h2 className="max-w-3xl text-5xl font-semibold leading-tight">
              Delivery operations for customers, agents, managers, and admins.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Create orders with zone-based charges, assign agents, track each
              status change, and handle failed delivery reschedules with email
              and SMS notifications.
            </p>
          </div>

          <div className="border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-semibold">Demo roles</h3>
            <div className="mt-4 grid gap-3 text-sm">
              {["Customer order desk", "Agent field app", "Manager operations", "Admin control room"].map(
                (item) => (
                  <div
                    className="flex items-center justify-between border border-[var(--line)] px-3 py-2"
                    key={item}
                  >
                    <span>{item}</span>
                    <span className="text-[var(--muted)]">Ready</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
