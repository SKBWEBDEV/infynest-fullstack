import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="914765992221-8cfi4l4u402j13mgol7gca9undslnogi.apps.googleusercontent.com">
      <CartProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </CartProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);