import type { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  onToggle: (id: string, is_completed: boolean) => void;
  onDelete: (id: string) => void;
};

export default function TodoList({ todos, onToggle, onDelete }: Props) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-4">
        タスクがありません
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
