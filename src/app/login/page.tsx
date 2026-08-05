import { login } from "./actions";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const from = typeof searchParams.from === "string" ? searchParams.from : "/dashboard";
  const hasError = searchParams.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-8"
      >
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Wandern Ops</h1>
          <p className="text-sm text-neutral-400">Enter the password to continue.</p>
        </div>
        <input type="hidden" name="from" value={from} />
        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
        />
        {hasError && <p className="text-sm text-red-400">Incorrect password.</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-neutral-100 px-3 py-2 font-medium text-neutral-900 hover:bg-white"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
