import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wide">UniEvent AI</Link>
        <div className="flex space-x-6 items-center">
          <Link to="/" className="hover:text-indigo-200 transition">Home</Link>
          <Link to="/events" className="hover:text-indigo-200 transition">Events</Link>
          {token ? (
            <>
              <Link to="/dashboard" className="hover:text-indigo-200 transition">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-indigo-200 transition">Admin</Link>
              )}
              <button onClick={handleLogout} className="bg-indigo-500 hover:bg-indigo-700 px-4 py-2 rounded-lg transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200 transition">Login</Link>
              <Link to="/register" className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
