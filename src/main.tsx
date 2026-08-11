import '@/styles/index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/App';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="528829308172-g5tt6v14japuti0t6gpep6q5rpipvea7.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
