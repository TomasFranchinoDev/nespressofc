import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bebas-neue/latin-400.css';
import '@fontsource-variable/oswald/index.css';
import '@fontsource-variable/inter/wght.css';
import './styles/globals.css';
import App from './App';

// Que el navegador no restaure la posición de scroll: la película empieza siempre desde el inicio.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
