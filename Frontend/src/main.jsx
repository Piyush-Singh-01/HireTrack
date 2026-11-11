import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { store } from './store/Store.js';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from './utils/ToastContext.jsx';

const queryClient = new QueryClient();


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </Provider>,
);

