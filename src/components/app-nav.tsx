import { logout } from "@/app/actions";

export function AppNav() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <span className="text-sm font-semibold uppercase tracking-wide text-neutral-100">
        Wandern Ops
      </span>
      <form action={logout}>
        <button type="submit" className="text-sm text-neutral-400 hover:text-neutral-200">
          Log out
        </button>
      </form>
    </header>
  );
}
