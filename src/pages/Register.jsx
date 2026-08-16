import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerUser({ fullName, email, password });
      login({ fullName: data.fullName, email: data.email }, data.token);
      navigate('/dashboard');
    } catch (err) {
     
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl w-full max-w-sm border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>

        {error && (
          <p className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</p>
        )}

        <label className="text-slate-400 text-sm">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full mt-1 mb-4 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="text-slate-400 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mt-1 mb-4 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="text-slate-400 text-sm">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full mt-1 mb-6 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-slate-400 text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;