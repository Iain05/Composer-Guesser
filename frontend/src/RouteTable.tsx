import { Routes, Route } from 'react-router-dom';
import DailyComposer from './pages/DailyComposer';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DailyComposer />} />
    </Routes>
  );
}
