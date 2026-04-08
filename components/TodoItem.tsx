import type { Todo } from "@/types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: string, is_completed: boolean) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className="flex items-center gap-3 py-2.5 px-1 border-b border-gray-100 last:border-0">
      <input
        type="checkbox"
        checked={todo.is_completed}
        onChange={() => onToggle(todo.id, todo.is_completed)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
      />
      <span
        className={`flex-1 text-sm ${
          todo.is_completed
            ? "line-through text-gray-400"
            : "text-gray-700"
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-400 hover:text-red-500 transition text-xs px-1"
        aria-label="削除"
      >
        削除
      </button>
    </li>
  );
}
