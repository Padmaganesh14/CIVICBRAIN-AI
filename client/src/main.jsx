import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppDataProvider } from './context/AppDataContext';
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </LanguageProvider>
  </React.StrictMode>
);
