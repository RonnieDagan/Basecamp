import { deleteTask } from "./actions";

export function DeleteTaskButton({ id }: { id: string }) {
  return (
    <form action={deleteTask}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-neutral-500 hover:text-red-400">
        Delete
      </button>
    </form>
  );
}
