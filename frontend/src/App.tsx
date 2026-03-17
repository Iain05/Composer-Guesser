import './App.css'
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './RouteTable';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div id="app-wrapper" className="h-full w-full flex flex-col items-center pt-4 pb-8 px-4">
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
