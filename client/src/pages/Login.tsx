import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      console.error('Register error:', err);
      setError('Something went wrong.');
    }
  };

  return (
    <>
      <Navbar showLogout={false} />
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-80">
          <div className="flex mb-4">
            <button
              onClick={() => {
                setTab('login');
                resetFields();
              }}
              className={`flex-1 py-2 rounded-l ${tab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setTab('register');
                resetFields();
              }}
              className={`flex-1 py-2 rounded-r ${tab === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
            {tab === 'register' && (
              <input
                id="name"
                name="name"
                className="border border-gray-300 p-2 w-full mb-3"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              id="email"
              name="email"
              className="border border-gray-300 p-2 w-full mb-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <input
              id="password"
              name="password"
              className="border border-gray-300 p-2 w-full mb-3"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 w-full rounded hover:bg-blue-600"
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
