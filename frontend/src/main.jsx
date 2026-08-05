import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import ApiWakeGate from './components/ApiWakeGate.jsx';
import './index.css';

// Minimal routing without adding a router dependency:
// /admin-dashboard -> organizer dashboard, everything else -> the public journey.
const isAdminRoute = window.location.pathname.startsWith('/admin-dashboard');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApiWakeGate>
      {isAdminRoute ? <AdminDashboard /> : <App />}
    </ApiWakeGate>
  </React.StrictMode>
);
