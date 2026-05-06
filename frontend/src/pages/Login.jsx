import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowRight, Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Login() {
  useDarkMode(); // apply stored theme preference
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9edf5] relative overflow-hidden px-4 py-10">

      {/* Background blobs */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[150px] top-[-200px] left-[-200px] opacity-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[150px] bottom-[-200px] right-[-200px] opacity-40 pointer-events-none" />

      {/* Main Card — responsive: fluid width, right panel hides on mobile */}
      <div className="relative w-full max-w-[900px] bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex overflow-hidden min-h-[480px]">

        {/* LEFT — form (always visible) */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10 z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hello!</h1>
          <p className="text-gray-500 mb-6 text-sm">Sign in to your account</p>

          {successMessage && (
            <div className="bg-green-100 text-green-600 text-sm p-3 rounded-2xl mb-4 flex items-center gap-2">
              <CheckCircle size={14} /> {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-2xl mb-4 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 bg-[#f3f5f9] px-5 py-3 rounded-full shadow-inner">
              <Mail size={18} className="text-purple-500 flex-shrink-0" />
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700 text-sm"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-[#f3f5f9] px-5 py-3 rounded-full shadow-inner">
              <Lock size={18} className="text-purple-500 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-purple-500 transition-colors flex-shrink-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember me */}
            <div className="px-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading
                ? <Loader2 className="animate-spin" size={16} />
                : <> SIGN IN <ArrowRight size={16} /> </>
              }
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-500 hover:underline font-medium">
              Create
            </Link>
          </p>
        </div>

        {/* RIGHT — accent panel, hidden on mobile */}
        <div className="hidden md:flex w-[45%] relative items-center justify-center text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-l-[120px]" />
          <div className="relative z-10 text-center px-10">
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-purple-100 text-sm leading-relaxed">
              Manage your bugs efficiently and stay productive with your system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
