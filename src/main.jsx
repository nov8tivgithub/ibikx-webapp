import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PreScreenProvider } from './context/PreScreenContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PreScreenProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </PreScreenProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
