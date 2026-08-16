import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Expenses', path: '/expenses' },
  { name: 'Reports', path: '/reports' },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
      <div>
        <h1 className="text-white text-xl font-bold mb-10">ExpenseFlow</h1>

        <nav className="space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <p className="text-slate-400 text-sm mb-3 truncate">{user?.fullName}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;