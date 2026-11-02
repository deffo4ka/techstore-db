import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4500,
        style: {
          borderRadius: '12px',
          background: '#1a2129',
          color: '#f4f6f8',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#14b8a6', secondary: '#1a2129' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#1a2129' },
        },
      }}
    />
  </React.StrictMode>
);
