import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// الستstyles والـ Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/landing.css';
import './styles/sidebar.css';

// المكون الرئيسي للمشروع
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);