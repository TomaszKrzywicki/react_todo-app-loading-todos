import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // ⬅️ import nazwany
import './styles/index.scss'; // ⬅️ jeśli masz globalne style w SCSS

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
