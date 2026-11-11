import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

async function startApplication() {
  const isLocalAdmin =
    import.meta.env.DEV &&
    /^\/admin(?:\/|$)/.test(window.location.pathname);

  if (isLocalAdmin) {
    const [{ default: AdminApp }, { BrowserRouter }] = await Promise.all([
      import('./admin/AdminApp.jsx'),
      import('react-router-dom'),
    ]);

    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <AdminApp />
        </BrowserRouter>
      </React.StrictMode>,
    );

    return;
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

startApplication();
