import { deleteTask } from "./actions";

export function DeleteTaskButton({ id }: { id: string }) {
  return (
    <form action={deleteTask}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="icon-del">
        ✕
      </button>
    </form>
  );
}
