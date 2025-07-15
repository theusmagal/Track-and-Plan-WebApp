import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  showLogout?: boolean; // Optional prop
}

function Navbar({ showLogout = true }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Track & Plan</h1>
      {showLogout && (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      )}
    </nav>
  );
}

export default Navbar;
