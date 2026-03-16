import './App.css'
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './RouteTable';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div id="app-wrapper" className="h-full w-full flex flex-col items-center py-8 px-4">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
