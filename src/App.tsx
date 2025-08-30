import React, { useEffect, useState } from 'react';
import { getTodos } from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { Notification } from './components/Notification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState('');

  // --- Funkcja loadTodos musi być zdefiniowana przed useEffect ---
  const loadTodos = async () => {
    try {
      setError('');
      const data = await getTodos(2479); // używamy USER_ID z api/todos.ts
      setTodos(data);
    } catch {
      setError('Unable to load todos. Please try again.');
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div className="todoapp">
      <header className="header">
        <h1 className="todoapp__title">Todo App</h1>

        {/* Dummy input, aby aplikacja nie wyglądała pusto */}
        <input
          type="text"
          className="new-todo"
          placeholder="What needs to be done?"
          disabled
        />
      </header>

      {/* Lista todos */}
      {todos.length > 0 ? (
        <TodoList todos={todos} />
      ) : (
        <p className="no-todos">No todos yet. Start by adding one!</p>
      )}

      {/* Powiadomienie o błędach */}
      <Notification message={error} onClose={() => setError('')} />
    </div>
  );
};
