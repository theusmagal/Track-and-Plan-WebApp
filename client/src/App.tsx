import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  //state to store JWT token from local storage
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  //get current route location
  const location = useLocation();

  useEffect(() => {
    // this way handle updates from other tabs 
    // if token is updated/deleted somewhere
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => {
      const current = localStorage.getItem('token');
      setToken(current);
    }, 500); // checks the token constantly

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // check if current route is /dashboard
  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      {/* show Navbar only if user is in the dashboard */}
      {token && isDashboard && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />

        {/* if token exists, show dashboard, otherwise redirect to login page */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
