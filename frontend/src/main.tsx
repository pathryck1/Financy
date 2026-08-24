import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './hooks/useAuth';
import { apolloClient } from './lib/apollo';
import './styles/globals.css';

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html');

createRoot(container).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
