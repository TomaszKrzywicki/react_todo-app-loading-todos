import React, { useState, useEffect, useCallback } from 'react';
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { UserWarning } from './UserWarning';

type Filter = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  }, []);

  const loadTodos = useCallback(async () => {
    try {
      setError('');
      const data = await getTodos();

      setTodos(data);
    } catch {
      showError('Unable to load todos');
    }
  }, [showError]);

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    loadTodos();
  }, [loadTodos]);

  const visibleTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      showError('Title should not be empty');

      return;
    }

    setIsAdding(true);
    try {
      const newTodo = await addTodo(trimmed);

      setTodos(prev => [...prev, newTodo]);
      setTitle('');
    } catch {
      showError('Unable to add a todo');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingIds(prev => [...prev, id]);
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch {
      showError('Unable to delete a todo');
    } finally {
      setLoadingIds(prev => prev.filter(todoId => todoId !== id));
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    setLoadingIds(prev => [...prev, id]);
    try {
      const updated = await updateTodo(id, { completed });

      setTodos(prev => prev.map(todo => (todo.id === id ? updated : todo)));
    } catch {
      showError('Unable to update a todo');
    } finally {
      setLoadingIds(prev => prev.filter(todoId => todoId !== id));
    }
  };

  const handleToggleAll = async () => {
    if (!todos.length) {
      return;
    }

    const allCompleted = todos.every(todo => todo.completed);
    const ids = todos.map(t => t.id);

    setLoadingIds(prev => [...prev, ...ids]);

    try {
      await Promise.all(
        todos.map(todo => updateTodo(todo.id, { completed: !allCompleted })),
      );
      setTodos(prev =>
        prev.map(todo => ({ ...todo, completed: !allCompleted })),
      );
    } catch {
      showError('Unable to update todos');
    } finally {
      setLoadingIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);

    if (!completedTodos.length) {
      return;
    }

    const ids = completedTodos.map(t => t.id);

    setLoadingIds(prev => [...prev, ...ids]);

    try {
      await Promise.all(completedTodos.map(t => deleteTodo(t.id)));
      setTodos(prev => prev.filter(t => !t.completed));
    } catch {
      showError('Unable to delete todos');
    } finally {
      setLoadingIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveEditing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) {
      return;
    }

    const trimmed = editingTitle.trim();

    if (!trimmed) {
      await handleDelete(editingId);
      cancelEditing();

      return;
    }

    setLoadingIds(prev => [...prev, editingId]);
    try {
      const updated = await updateTodo(editingId, { title: trimmed });

      setTodos(prev =>
        prev.map(todo => (todo.id === editingId ? updated : todo)),
      );
      cancelEditing();
    } catch {
      showError('Unable to update a todo');
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== editingId));
    }
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all ${
              todos.length && todos.every(t => t.completed) ? 'active' : ''
            }`}
            data-cy="ToggleAllButton"
            onClick={handleToggleAll}
            disabled={!todos.length || loadingIds.length > 0}
          />

          <form onSubmit={handleAddTodo}>
            <label htmlFor="new-todo-field" className="visually-hidden">
              New todo title
            </label>
            <input
              id="new-todo-field"
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isAdding || loadingIds.length > 0}
              autoFocus
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => {
            const checkboxId = `todo-checkbox-${todo.id}`;
            const editingInputId = `todo-edit-input-${todo.id}`;

            if (editingId === todo.id) {
              return (
                <div key={todo.id} className="todo">
                  <label
                    className="todo__status-label"
                    aria-label="Toggle todo completion"
                  >
                    <input
                      id={checkboxId}
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id, !todo.completed)}
                      disabled={loadingIds.includes(todo.id)}
                    />
                  </label>

                  <form onSubmit={saveEditing}>
                    <label htmlFor={editingInputId} className="visually-hidden">
                      Edit todo title
                    </label>
                    <input
                      id={editingInputId}
                      data-cy="TodoTitleField"
                      type="text"
                      className="todo__title-field"
                      placeholder="Empty todo will be deleted"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      autoFocus
                      disabled={loadingIds.includes(todo.id)}
                      onBlur={cancelEditing}
                    />
                  </form>

                  <div
                    data-cy="TodoLoader"
                    className={`modal overlay ${
                      loadingIds.includes(todo.id) ? 'is-active' : ''
                    }`}
                  >
                    <div
                      className="modal-background has-background-white-
                    ter"
                    />
                    <div className="loader" />
                  </div>
                </div>
              );
            }

            return (
              <div
                data-cy="Todo"
                key={todo.id}
                className={`todo ${todo.completed ? 'completed' : ''}`}
              >
                <label
                  className="todo__status-label"
                  aria-label="Toggle todo completion"
                >
                  <input
                    id={checkboxId}
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id, !todo.completed)}
                    disabled={loadingIds.includes(todo.id)}
                  />
                </label>

                <span
                  data-cy="TodoTitle"
                  className="todo__title"
                  onDoubleClick={() => startEditing(todo)}
                  style={{ userSelect: 'none', cursor: 'pointer' }}
                >
                  {todo.title}
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                  onClick={() => handleDelete(todo.id)}
                  disabled={loadingIds.includes(todo.id)}
                >
                  ×
                </button>

                <div
                  data-cy="TodoLoader"
                  className={`modal overlay ${
                    loadingIds.includes(todo.id) ? 'is-active' : ''
                  }`}
                >
                  <div
                    className="modal-background has-background-white-
                  ter"
                  />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(t => !t.completed).length} items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={e => {
                  e.preventDefault();
                  setFilter('all');
                }}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${
                  filter === 'active' ? 'selected' : ''
                }`}
                data-cy="FilterLinkActive"
                onClick={e => {
                  e.preventDefault();
                  setFilter('active');
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${
                  filter === 'completed' ? 'selected' : ''
                }`}
                data-cy="FilterLinkCompleted"
                onClick={e => {
                  e.preventDefault();
                  setFilter('completed');
                }}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={handleClearCompleted}
              disabled={!todos.some(t => t.completed) || loadingIds.length > 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${
          error ? '' : 'hidden'
        }`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError('')}
        />
        {error}
      </div>
    </div>
  );
};
