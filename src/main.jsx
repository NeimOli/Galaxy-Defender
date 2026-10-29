import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import API from './services/api.js';
import './styles/style.css';
import './styles/records.css';

// Expose API globally for game engine interoperability
window.API = API;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

