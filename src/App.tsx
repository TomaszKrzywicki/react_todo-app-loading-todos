import React, { useState, useEffect, useCallback } from 'react';
import { Todo } from './types/Todo';
import { getTodos, USER_ID } from './api/todos';
import { UserWarning } from './UserWarning';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  }, []);

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

  // Filtrowanie todos po statusie
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
      <h1 className="todoapp__title">todos</h1>

      {!USER_ID && <UserWarning />}

      {USER_ID && (
        <>
          <header className="todoapp__header">
            <form>
              <input
                type="text"
                className="todoapp__new-todo"
                placeholder="What needs to be done?"
                disabled
              />
            </form>
          </header>

          <TodoList todos={filteredTodos} />

          {todos.length > 0 && (
            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {filteredTodos.length} items
              </span>
              <nav className="filter" data-cy="Filter">
                <button
                  className={filter === 'all' ? 'selected' : ''}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={filter === 'active' ? 'selected' : ''}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={filter === 'completed' ? 'selected' : ''}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </nav>
            </footer>
          )}
        </>
      )}

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
