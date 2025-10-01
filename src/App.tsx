import React, { useState, useEffect, useCallback } from 'react';
import { getTodos, Todo, USER_ID } from './api/todos';
import { UserWarning } from './UserWarning';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // 🔹 Funkcja do pokazywania błędów
  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  }, []);

  // 🔹 Ładowanie todos
  const loadTodos = useCallback(async () => {
    try {
      const todosFromServer = await getTodos();

      setTodos(todosFromServer);
    } catch {
      showError('Unable to load todos');
    }
  }, [showError]);

  useEffect(() => {
    if (USER_ID) {
      loadTodos();
    }
  }, [loadTodos]);

  // 🔹 Filtrowanie todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true; // all
  });

  // 🔹 Handler filtrowania
  const handleFilterChange = (status: 'all' | 'active' | 'completed') => {
    setFilter(status);
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      {/* Wyświetlamy UserWarning jeśli brak USER_ID */}
      {!USER_ID && <UserWarning />}

      {USER_ID && (
        <div className="todoapp__content">
          <header className="todoapp__header">
            {/* Dummy input */}
            <form>
              <input
                type="text"
                className="todoapp__new-todo"
                placeholder="What needs to be done?"
                disabled
              />
            </form>
          </header>

          {/* Lista todos */}
          {filteredTodos.length > 0 && <TodoList todos={filteredTodos} />}

          {/* Stopka z filtrem */}
          {todos.length > 0 && (
            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {filteredTodos.length} items
              </span>
              <nav className="filter" data-cy="Filter">
                <button
                  className={filter === 'all' ? 'selected' : ''}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
                <button
                  className={filter === 'active' ? 'selected' : ''}
                  onClick={() => handleFilterChange('active')}
                >
                  Active
                </button>
                <button
                  className={filter === 'completed' ? 'selected' : ''}
                  onClick={() => handleFilterChange('completed')}
                >
                  Completed
                </button>
              </nav>
            </footer>
          )}
        </div>
      )}

      {/* Notification */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger ${errorMessage ? '' : 'hidden'}`}
      >
        <button
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
