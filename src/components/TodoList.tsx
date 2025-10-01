import React from 'react';
import { Todo } from '../api/todos';

type Props = {
  todos: Todo[];
};

export const TodoList: React.FC<Props> = ({ todos }) => (
  <section className="main">
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          <div className="view">
            <input
              type="checkbox"
              className="toggle"
              checked={todo.completed}
              readOnly
            />
            <label>{todo.title}</label>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
