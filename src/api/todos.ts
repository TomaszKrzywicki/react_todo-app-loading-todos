import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

// 🔹 Tu wpisz swój userId z rejestracji (np. 2479)
export const USER_ID = 2479;

// ✅ Eksport typu, żeby można było go importować w App.tsx
export type { Todo };

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const addTodo = (title: string) => {
  return client.post<Todo>('/todos', {
    title,
    userId: USER_ID,
    completed: false,
  });
};

export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${todoId}`);
};

export const updateTodo = (todoId: number, data: Partial<Todo>) => {
  return client.patch<Todo>(`/todos/${todoId}`, data);
};
