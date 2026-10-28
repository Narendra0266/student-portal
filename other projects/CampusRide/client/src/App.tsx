import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

function App() {
  const token = localStorage.getItem('token');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={token ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/" element={token ? <HomePage /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
