import React, { useEffect, useState } from 'react';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { Notification } from './components/Notification';

const USER_ID = 2479;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [error, setError] = useState<string | null>(null);

  const loadTodos = async () => {
    try {
      setError(null);
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${USER_ID}/todos`,
      );

      if (!response.ok) {
        throw new Error('Unable to load todos');
      }

      const data: Todo[] = await response.json();

      setTodos(data);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">Todos</h1>

      {todos.length > 0 && (
        <>
          <TodoList todos={filteredTodos} />

          <Footer
            todos={todos}
            currentFilter={filter}
            onFilterChange={setFilter}
          />
        </>
      )}

      <Notification message={error} onClose={() => setError(null)} />
    </div>
  );
};
